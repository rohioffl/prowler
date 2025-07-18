from mongoengine import Document, EmbeddedDocument, StringField, ListField, EmbeddedDocumentField, DateTimeField

class Resource(EmbeddedDocument):
    Type = StringField()
    Id = StringField()
    Partition = StringField()
    Region = StringField()

class AssociatedStandard(EmbeddedDocument):
    StandardsId = StringField()

class Recommendation(EmbeddedDocument):
    Text = StringField()
    Url = StringField()

class Remediation(EmbeddedDocument):
    Recommendation = EmbeddedDocumentField(Recommendation)

class Compliance(EmbeddedDocument):
    Status = StringField()
    RelatedRequirements = ListField(StringField())
    AssociatedStandards = ListField(EmbeddedDocumentField(AssociatedStandard))

class Severity(EmbeddedDocument):
    Label = StringField()

class Finding(EmbeddedDocument):
    Id = StringField()
    Title = StringField()
    Description = StringField()
    AwsAccountId = StringField()
    Severity = EmbeddedDocumentField(Severity)
    Types = ListField(StringField())
    Resources = ListField(EmbeddedDocumentField(Resource))
    Compliance = EmbeddedDocumentField(Compliance)
    CreatedAt = StringField()
    UpdatedAt = StringField()
    FirstObservedAt = StringField()
    Remediation = EmbeddedDocumentField(Remediation)
    RecordState = StringField()

class AWSResult(Document):
    date = DateTimeField()
    provider = StringField()
    accountId = StringField()
    region = StringField()
    findings = ListField(EmbeddedDocumentField(Finding))
