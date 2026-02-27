public with sharing class FileUploadController {
    @AuraEnabled
    public static Id uploadFile(String base64, String filename, Id recordId, String fileType) {
        try {
            Blob fileBlob = EncodingUtil.base64Decode(base64);
            ContentVersion contentVersion = new ContentVersion();
            contentVersion.Title = filename;
            contentVersion.PathOnClient = filename;
            contentVersion.VersionData = fileBlob;
            contentVersion.FirstPublishLocationId = recordId;
            insert contentVersion;

            return [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion.Id].ContentDocumentId;
        } catch (Exception e) {
            throw new AuraHandledException('Error uploading file: ' + e.getMessage());
        }
    }
}