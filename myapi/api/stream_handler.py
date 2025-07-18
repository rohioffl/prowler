import json
import threading
from datetime import datetime
from .models.aws_result import AWSResult, Finding, Severity, Resource, Compliance, AssociatedStandard, Remediation, Recommendation



findings_data = []
spinner_running = False
spinner_thread = None
process = None
account_id = None
region = None

def stream_output():
    global findings_data, spinner_running, spinner_thread, process

    for line in iter(process.stdout.readline, ''):
        try:
            parsed = json.loads(line)
            findings_data.append(parsed)
        except json.JSONDecodeError:
            pass

        print(line, end='')
        yield f"data: {json.dumps({'output': line.strip()})}\n\n"

    process.wait()
    yield "data: {\"status\": \"complete\"}\n\n"

    spinner_running = False
    if spinner_thread:
        spinner_thread.join()

    threading.Thread(target=save_results_to_mongo).start()


def save_results_to_mongo():
    parsed_findings = []
    for item in findings_data:
        try:
            sev_doc = Severity(Label=item.get('Severity', {}).get('Label'))

            resources = [
                Resource(
                    Type=res.get('Type'),
                    Id=res.get('Id'),
                    Partition=res.get('Partition'),
                    Region=res.get('Region')
                )
                for res in item.get('Resources', [])
            ]

            comp_data = item.get('Compliance', {})
            standards = [
                AssociatedStandard(StandardsId=s.get('StandardsId'))
                for s in comp_data.get('AssociatedStandards', [])
            ]
            compliance_doc = Compliance(
                Status=comp_data.get('Status'),
                RelatedRequirements=comp_data.get('RelatedRequirements', []),
                AssociatedStandards=standards
            )

            remediation_data = item.get('Remediation', {}).get('Recommendation', {})
            remediation_doc = Remediation(
                Recommendation=Recommendation(
                    Text=remediation_data.get('Text'),
                    Url=remediation_data.get('Url')
                )
            ) if remediation_data else None

            finding = Finding(
                Id=item.get('Id'),
                Title=item.get('Title'),
                Description=item.get('Description'),
                AwsAccountId=item.get('AwsAccountId'),
                Severity=sev_doc,
                Types=item.get('Types', []),
                Resources=resources,
                Compliance=compliance_doc,
                CreatedAt=item.get('CreatedAt'),
                UpdatedAt=item.get('UpdatedAt'),
                FirstObservedAt=item.get('FirstObservedAt'),
                Remediation=remediation_doc,
                RecordState=item.get('RecordState')
            )
            parsed_findings.append(finding)
        except Exception as parse_err:
            print(f"Parse error: {parse_err}")
            continue

    AWSResult(
        date=datetime.utcnow(),
        provider="AWS",
        accountId=account_id,
        region=region,
        findings=parsed_findings
    ).save()
