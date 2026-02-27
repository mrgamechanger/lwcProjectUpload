public with sharing class GrantApplicationService {
    @AuraEnabled
    public class Disbursement {
        @AuraEnabled public Integer month;
        @AuraEnabled public Decimal amount;
        @AuraEnabled public Date date;
        public Disbursement(Integer month, Decimal amount, Date date) {
            this.month = month;
            this.amount = amount;
            this.date = date;
        }
    }

    @AuraEnabled
    public class SubmissionResult {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public List<Disbursement> disbursements;
        public SubmissionResult() {
            success = false;
            message = '';
            disbursements = new List<Disbursement>();
        }
    }

    @AuraEnabled
    public static SubmissionResult submitGrantApplication(String firstName, String lastName, String phone, String postalCode, Decimal monthlyIncome, String supportOption) {
        SubmissionResult res = new SubmissionResult();
        try {
            if (String.isBlank(phone)) {
                res.message = 'Phone is required';
                return res;
            }

            // Normalize phone: keep digits only and ensure country code
            String normalizedPhone = phone.replaceAll('\\D','');
            if (!normalizedPhone.startsWith('65')) {
                normalizedPhone = '65' + normalizedPhone;
            }

            // Check association: if any Contact already has this phone (Phone or MobilePhone), do not create/update
            List<Contact> existing = [
                SELECT Id
                FROM Contact
                WHERE Phone = :normalizedPhone OR MobilePhone = :normalizedPhone
                LIMIT 1
            ];
            if (!existing.isEmpty()) {
                res.success = false;
                res.message = 'A contact already exists with this phone number. No new contact was created.';
                return res;
            }

            // Create new Contact since phone is not associated
            Contact c = new Contact(
                FirstName = firstName,
                LastName = lastName,
                Phone = normalizedPhone,
                MobilePhone = normalizedPhone,
                MailingPostalCode = postalCode,
                Description = 'MonthlyIncome:' + String.valueOf(monthlyIncome) + ';SupportOption:' + supportOption
            );
            insert c;
            res.message = 'Contact created';

            Integer months = 0;
            Decimal amount = 0;
            if (supportOption == 'BASIC') { months = 3; amount = 500; }
            else if (supportOption == 'STANDARD') { months = 6; amount = 300; }
            else if (supportOption == 'PREMIUM') { months = 12; amount = 200; }
            else {
                res.message = 'Invalid support option';
                return res;
            }

            Date startDate = Date.today();
            for (Integer i = 0; i < months; i++) {
                res.disbursements.add(new Disbursement(i+1, amount, startDate.addMonths(i)));
            }

            res.success = true;
            return res;
        } catch (Exception e) {
            res.success = false;
            res.message = 'Error: ' + e.getMessage();
            return res;
        }
    }
}
