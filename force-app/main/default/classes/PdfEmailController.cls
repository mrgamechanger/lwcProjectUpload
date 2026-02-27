public with sharing class PdfEmailController {
    public PdfEmailController() {

    }

    @AuraEnabled(cacheable=true)
    public static List<PdfRecordWrapper> getPdfRecords() {
        try {
            // Query the custom object that stores PDFs
            // Replace 'Pdf_Storage__c' with your actual custom object API name
            List<Pdf_Storage__c> pdfRecords = [
                SELECT Id, Name, Description__c, CreatedDate, LastModifiedDate, Owner.Name
                FROM Pdf_Storage__c
                ORDER BY CreatedDate DESC
                LIMIT 50
            ];
            
            List<PdfRecordWrapper> wrappers = new List<PdfRecordWrapper>();
            
            for(Pdf_Storage__c record : pdfRecords) {
                wrappers.add(new PdfRecordWrapper(record));
            }
            
            return wrappers;
        } catch(Exception e) {
            throw new AuraHandledException('Error fetching PDF records: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static String sendPdfEmail(String recordId, String emailTo, String emailSubject, String emailBody) {
        try {
            // Get the PDF record
            Pdf_Storage__c pdfRecord = [
                SELECT Id, Name, Description__c, Content__c, ContentType__c
                FROM Pdf_Storage__c
                WHERE Id = :recordId
                LIMIT 1
            ];
            
            // Create email message
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setToAddresses(new List<String>{emailTo});
            email.setSubject(emailSubject);
            email.setPlainTextBody(emailBody);
            
            // Create attachment
            Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();
            attachment.setFileName(pdfRecord.Name + '.pdf');
            attachment.setBody(Blob.valueOf(pdfRecord.Content__c));
            attachment.setContentType('application/pdf');
            
            email.setFileAttachments(new List<Messaging.EmailFileAttachment>{attachment});
            
            // Send email
            Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{email});
            
            return 'Email sent successfully';
        } catch(Exception e) {
            throw new AuraHandledException('Error sending email: ' + e.getMessage());
        }
    }
    
    // Wrapper class for PDF records
    public class PdfRecordWrapper {
        @AuraEnabled public String id;
        @AuraEnabled public String name;
        @AuraEnabled public String description;
        @AuraEnabled public DateTime createdDate;
        @AuraEnabled public DateTime lastModifiedDate;
        @AuraEnabled public String ownerName;
        
        public PdfRecordWrapper(Pdf_Storage__c record) {
            this.id = record.Id;
            this.name = record.Name;
            this.description = record.Description__c;
            this.createdDate = record.CreatedDate;
            this.lastModifiedDate = record.LastModifiedDate;
            this.ownerName = record.Owner.Name;
        }
    }
}