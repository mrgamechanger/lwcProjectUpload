public with sharing class GeneratePdf {


    public class ContactWrapper {
        @AuraEnabled public String contactname { get; set; }
        @AuraEnabled public String Phone { get; set; }
        @AuraEnabled public String Email { get; set; }
    }

    @AuraEnabled
    public static Contact getpdf(ContactWrapper wrapper) {
        try {
            // Basic validation
            if (wrapper == null) {
                throw new AuraHandledException('Request payload is required.');
            }
            if (String.isBlank(wrapper.contactname) || String.isBlank(wrapper.Email)) {
                throw new AuraHandledException('Contact Name and Email are mandatory.');
            }

            // Create Contact
            Contact createdContact = new Contact(
                LastName = wrapper.contactname,
                Phone    = wrapper.Phone,
                Email    = wrapper.Email
            );
            insert createdContact;

            // Build HTML for PDF
            String html =
                '<html><body>' +
                '<h1>Contact Details</h1>' +
                '<p>Contact Name: ' + createdContact.LastName + '</p>' +
                '<p>Contact Phone: ' + createdContact.Phone + '</p>' +
                '<p>Contact Email: ' + createdContact.Email + '</p>' +
                '</body></html>';

            // Convert to PDF
            Blob pdfBlob = Blob.toPdf(html); // Spring '26+ feature for HTML to PDF.[web:38][web:40]

            // Save as file (ContentVersion)
            ContentVersion cv = new ContentVersion();
            cv.Title = createdContact.LastName + ' PDF';
            cv.PathOnClient = createdContact.LastName + '.pdf';
            cv.VersionData = pdfBlob;
            cv.IsMajorVersion = true;
            cv.FirstPublishLocationId = createdContact.Id;
            insert cv;

            // Prepare email attachment
            Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();
            attachment.setFileName(createdContact.LastName + '_ContactDetails.pdf');
            attachment.setBody(pdfBlob);
            attachment.setContentType('application/pdf');

            // Prepare and send email
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setSubject('Contact Details PDF of ' + createdContact.LastName);
            mail.setToAddresses(new String[] { createdContact.Email });
            mail.setPlainTextBody('Please find attached the PDF containing your contact details.');
            mail.setFileAttachments(new Messaging.EmailFileAttachment[] { attachment });

            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail }); // Standard outbound email pattern.[web:20][web:19]

            return createdContact;
        } catch (Exception ex) {
            throw new AuraHandledException('Error while generating PDF/email: ' + ex.getMessage());
        }
    }


}