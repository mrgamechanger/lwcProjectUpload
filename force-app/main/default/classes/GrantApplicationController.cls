/**
 * @description Controller class for Grant Application LWC
 * Provides Apex methods called from the LWC component
 */
public with sharing class GrantApplicationController {
    /**
     * @description Submits a grant application via LWC
     * @param firstName Applicant's first name
     * @param lastName Applicant's last name
     * @param phone Applicant's phone number
     * @param postalCode Applicant's postal code
     * @param monthlyIncome Applicant's monthly income
     * @param supportOption Selected support option
     * @return Map containing success status and message
     */
    @AuraEnabled
    public static Map<String, Object> submitGrantApplication(
        String firstName,
        String lastName,
        String phone,
        String postalCode,
        Decimal monthlyIncome,
        String supportOption
    ) {
        GrantApplicationDTO dto = new GrantApplicationDTO(
            firstName,
            lastName,
            phone,
            postalCode,
            monthlyIncome,
            supportOption
        );

        return GrantApplicationService.submitApplication(dto);
    }
}
