from django.http import FileResponse, JsonResponse ,StreamingHttpResponse
import subprocess
import os
from django.views.decorators.csrf import csrf_exempt
import json
import boto3
import logging
import threading
from bson import ObjectId
import time
from datetime import datetime
from pathlib import Path 
from .models.aws_result import AWSResult, Finding, Severity, Resource, Compliance, AssociatedStandard, Remediation, Recommendation

logger = logging.getLogger(__name__)
spinner_running = True

@csrf_exempt
def download_cf_template(request):
    file_path = os.path.join(os.path.dirname(__file__), 'templates', 'external_audit_template.yaml')
    return FileResponse(open(file_path, 'rb'), as_attachment=True, filename='external_audit_template.yaml')


def cli_spinner():
    """Prints a live CLI spinner in the server terminal."""
    spinner = ['|', '/', '-', '\\']
    i = 0
    while spinner_running:
        print(f'\rScanning... {spinner[i % len(spinner)]}', end='', flush=True)
        time.sleep(0.1)
        i += 1
    print('\rScan complete.           ')  # Clear line after done


# @csrf_exempt
# def start_scan(request):
#     if request.method == 'POST':
#         try:
#             body = json.loads(request.body)
#             account_id = body.get("accountId")
#             region = body.get("region")

#             role_arn = f"arn:aws:iam::{account_id}:role/ExternalAuditRole"
#             command = [
#                 "/home/ac/.local/bin/prowler", "aws",
#                 "--region", region,
#                 "--role", role_arn,
#                 "--ignore-exit-code-3"
#             ]

#             # Start CLI spinner in a background thread
#             global spinner_running
#             spinner_running = True
#             spinner_thread = threading.Thread(target=cli_spinner)
#             spinner_thread.start()

#             process = subprocess.Popen(
#                 command,
#                 stdout=subprocess.PIPE,
#                 stderr=subprocess.STDOUT,
#                 text=True,
#                 bufsize=1,
#                 universal_newlines=True
#             )

#             def stream_output():
#                 for line in iter(process.stdout.readline, ''):
#                     yield f"data: {json.dumps({'output': line})}\n\n"

#                 process.wait()
#                 if process.returncode != 0 and process.returncode != 3:
#                     yield f"data: {json.dumps({'error': f'Process exited with code {process.returncode}'})}\n\n"
#                 yield "data: {\"status\": \"complete\"}\n\n"

#                 # Stop the spinner
#                 global spinner_running
#                 spinner_running = False
#                 spinner_thread.join()

#             return StreamingHttpResponse(
#                 stream_output(),
#                 content_type='text/event-stream'
#             )

#         except Exception as e:
#             spinner_running = False  # Stop spinner on exception
#             return JsonResponse({'error': str(e)}, status=500)

#     return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def start_scan(request):
    try:
        body = json.loads(request.body)
        account_id = body.get("accountId")
        region = body.get("region")
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    if not account_id or not region:
        return JsonResponse({'error': 'Missing accountId or region'}, status=400)

    BASE_DIR = Path('/home/ac/test/prowler/myapi')
    OUTPUT_DIR = BASE_DIR / 'output'
    OUTPUT_DIR.mkdir(exist_ok=True, mode=0o775)



    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    filename_no_ext = f"prowler-output-{account_id}-{timestamp}"
    output_path = OUTPUT_DIR / filename_no_ext
    output_file = output_path.with_suffix(".asff.json")

    print(f"BASE_DIR: {BASE_DIR}")
    print(f"OUTPUT_DIR: {OUTPUT_DIR}")
    print(f"output_path: {output_path}")
    print(f"output_file: {output_file}")

    

    role_arn = f'arn:aws:iam::{account_id}:role/ExternalAuditRole'
    command = [
        "/home/ac/.local/bin/prowler", "aws",
        "--region", region,
        "--role", role_arn,
        "--ignore-exit-code-3",
        "--output-formats", "json-asff",
        "--output-file", 
    ]

    try:
        logger.info("Starting Prowler scan...")

        # Use Popen to stream live output to terminal
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        # Print each line as it comes in
        for line in iter(process.stdout.readline, ''):
            print(line, end='', flush=True)

        process.stdout.close()
        return_code = process.wait()

        if return_code not in [0, 3]:
            logger.error(f"Prowler failed with return code {return_code}")
            return JsonResponse({
                'status': 'error',
                'message': f'Prowler failed with return code {return_code}'
            }, status=500)

        logger.info("Prowler scan completed successfully")

    except Exception as e:
        logger.exception("Prowler execution failed")
        return JsonResponse({
            'status': 'error',
            'message': f'Prowler execution failed: {str(e)}'
        }, status=500)

    if not output_file.exists():
        logger.error(f"Output file not found: {output_file}")
        return JsonResponse({
            'status': 'error',
            'message': f'Output file not found: {output_file}'
        }, status=500)

    # Proceed with processing findings and saving to MongoDB (same as before)
    try:
        logger.info(f"Processing findings from {output_file}")
        with output_file.open('r') as f:
            findings_data = json.load(f)

        if not isinstance(findings_data, list):
            findings_data = [findings_data]

        mongo_findings = []

        for item in findings_data:
            try:
                sev = item.get("Severity", {})
                sev_doc = Severity(Label=sev.get("Label"))

                resources = [
                    Resource(
                        Type=res.get("Type"),
                        Id=res.get("Id"),
                        Partition=res.get("Partition"),
                        Region=res.get("Region")
                    ) for res in item.get("Resources", [])
                ]

                comp_data = item.get("Compliance", {})
                standards = [
                    AssociatedStandard(StandardsId=s.get("StandardsId"))
                    for s in comp_data.get("AssociatedStandards", [])
                ]
                compliance_doc = Compliance(
                    Status=comp_data.get("Status"),
                    RelatedRequirements=comp_data.get("RelatedRequirements", []),
                    AssociatedStandards=standards
                )

                remediation_data = item.get("Remediation", {}).get("Recommendation", {})
                remediation_doc = Remediation(
                    Recommendation=Recommendation(
                        Text=remediation_data.get("Text"),
                        Url=remediation_data.get("Url")
                    )
                ) if remediation_data else None

                finding_doc = Finding(
                    Id=item.get("Id"),
                    Title=item.get("Title"),
                    Description=item.get("Description"),
                    AwsAccountId=item.get("AwsAccountId"),
                    Severity=sev_doc,
                    Types=item.get("Types", []),
                    Resources=resources,
                    Compliance=compliance_doc,
                    CreatedAt=item.get("CreatedAt"),
                    UpdatedAt=item.get("UpdatedAt"),
                    FirstObservedAt=item.get("FirstObservedAt"),
                    Remediation=remediation_doc,
                    RecordState=item.get("RecordState")
                )

                mongo_findings.append(finding_doc)

            except Exception as parse_err:
                logger.error(f"Error parsing finding: {parse_err}")
                continue

        result_doc = AWSResult(
            date=datetime.utcnow(),
            provider="AWS",
            accountId=account_id,
            region=region,
            findings=mongo_findings
        )
        result_doc.save()

        logger.info(f"Saved {len(mongo_findings)} findings to MongoDB")

        return JsonResponse({
            'status': 'success',
            'accountId': account_id,
            'region': region,
            'findings_count': len(mongo_findings)
        })

    except Exception as e:
        logger.exception("Failed to process findings")
        return JsonResponse({
            'status': 'error',
            'message': f'Failed to process findings: {str(e)}'
        }, status=500)




@csrf_exempt
def scan_history(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        collection = AWSResult._get_collection()

        pipeline = [
    {
        '$project': {
            'findings': 0
        }
    }, {
        '$sort': {
            'date': -1
        }
    }
]
        scans = list(collection.aggregate(pipeline))
        for scan in scans:
            scan['_id'] = str(scan['_id'])  # convert ObjectId to string

        return JsonResponse({'success': True, 'scans': scans}, safe=False)
    except Exception as e:
        return JsonResponse({'success': False, 'message': 'Failed to fetch scan history'}, status=500)

@csrf_exempt
def scan_detail(request, scan_id):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        collection = AWSResult._get_collection()

        pipeline = [
            { '$match': { '_id': ObjectId(scan_id) } },
            { '$unwind': '$findings' },
            {
                '$project': {
                    '_id': 0,
                    'scanId': { '$toString': '$_id' },
                    'region': '$region',
                    'accountId': '$accountId',
                    'findingId': '$findings.Id',
                    'awsAccountId': '$findings.AwsAccountId',
                    'title': '$findings.Title',
                    'description': '$findings.Description',
                    'severity': '$findings.Severity.Label',
                    'recordState': '$findings.RecordState',
                    'status': '$findings.Compliance.Status',
                    'createdAt': '$findings.CreatedAt',
                    'type':'$findings.Resources.Type',
                    'resourceARN':"$findings.Resources.Id",
                    'cloudProvider':'$findings.Resources.Partition'
                  
                }
            }
        ]

        results = list(collection.aggregate(pipeline))

        if not results:
            return JsonResponse({'success': False, 'message': 'Scan not found'}, status=404)

        # Extract shared scan details from the first result
        response = {
            'success': True,
            'scanId': results[0].get('scanId'),
            'region': results[0].get('region'),
            'accountId': results[0].get('accountId'),
            'findings': results  # This already contains only finding fields
        }

        return JsonResponse(response, safe=False)

    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Failed to fetch findings: {str(e)}'}, status=500)