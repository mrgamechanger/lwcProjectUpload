public with sharing class RecordPdfController {
    
    public Account record { get; set; }
    
    public RecordPdfController() {
        // Get the record ID from the URL parameters
        String recordId = ApexPages.currentPage().getParameters().get('id');
        
        if (String.isNotBlank(recordId)) {
            try {
                // Query the record with all necessary fields
                record = [
                    SELECT Id, Name, Description, CreatedDate, LastModifiedDate, 
                           Owner.Name
                    FROM Account 
                    WHERE Id = :recordId
                    LIMIT 1
                ];
            } catch (Exception e) {
                // Handle error - you might want to redirect or show an error message
                ApexPages.addMessage(new ApexPages.Message(
                    ApexPages.Severity.ERROR, 
                    'Error retrieving record: ' + e.getMessage()
                ));
            }
        } else {
            // No record ID provided
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.ERROR, 
                'No record ID provided'
            ));
        }
    }
} 