public with sharing class EligibilityController {
    @AuraEnabled
    public static void sendEligibilityEmail(String name, String phone, String email, Decimal cibilScore) {
        // Determine eligibility based on CIBIL score
        Boolean isEligible = cibilScore >= 700;
        
        // Construct email content
        String subject = 'Your Eligibility Status';
        String body = 'Dear ' + name + ',\n\n';
        if(isEligible) {
            body += 'Congratulations! Based on your CIBIL score of ' + cibilScore + ', you are eligible for our services.';
        } else {
            body += 'We regret to inform you that with a CIBIL score of ' + cibilScore + ', you are currently not eligible for our services.';
        }
        body += '\n\nBest regards,\nYour Company Name';

        // Create email message
        Messaging.SingleEmailMessage emailMessage = new Messaging.SingleEmailMessage();
        emailMessage.setToAddresses(new String[] { email });
        emailMessage.setSubject(subject);
        emailMessage.setHtmlBody('<h1>'+ body + '</h1>');
        emailMessage.setPlainTextBody(body);

        // Send email
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { emailMessage });
    }
}
