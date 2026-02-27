/**
 * @description DTO (Data Transfer Object) class for Grant Application
 * This class encapsulates all data needed for grant application submission
 */
public class GrantApplicationDTO {
    public String firstName;
    public String lastName;
    public String phone;
    public String postalCode;
    public Decimal monthlyIncome;
    public String supportOption;

    /**
     * @description Constructor for GrantApplicationDTO
     * @param firstName First name of applicant
     * @param lastName Last name of applicant
     * @param phone Phone number in format 65xxxxxxxx
     * @param postalCode 6-digit postal code
     * @param monthlyIncome Monthly income in SGD
     * @param supportOption Support option (BASIC, STANDARD, PREMIUM)
     */
    public GrantApplicationDTO(
        String firstName,
        String lastName,
        String phone,
        String postalCode,
        Decimal monthlyIncome,
        String supportOption
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.postalCode = postalCode;
        this.monthlyIncome = monthlyIncome;
        this.supportOption = supportOption;
    }

    /**
     * @description Validates all required fields in the DTO
     * @return Boolean - true if all fields are valid, false otherwise
     */
    public Boolean isValid() {
        return String.isNotBlank(this.firstName)
            && String.isNotBlank(this.lastName)
            && String.isNotBlank(this.phone)
            && String.isNotBlank(this.postalCode)
            && this.monthlyIncome != null
            && this.monthlyIncome > 0
            && String.isNotBlank(this.supportOption);
    }
}
