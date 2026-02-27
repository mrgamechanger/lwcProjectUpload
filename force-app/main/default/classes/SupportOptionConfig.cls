/**
 * @description Configuration class for support options
 * Manages support option definitions including monthly amounts and durations
 */
public class SupportOptionConfig {
    public static final Map<String, SupportOption> OPTIONS = new Map<String, SupportOption>{
        'BASIC' => new SupportOption('BASIC', 300, 3),
        'STANDARD' => new SupportOption('STANDARD', 250, 6),
        'PREMIUM' => new SupportOption('PREMIUM', 200, 12)
    };

    /**
     * @description Represents a support option with monthly amount and duration
     */
    public class SupportOption {
        public String code;
        public Decimal monthlyAmount;
        public Integer months;
        public Decimal totalAmount;

        /**
         * @description Constructor for SupportOption
         * @param code Option code (BASIC, STANDARD, PREMIUM)
         * @param monthlyAmount Monthly disbursement amount in SGD
         * @param months Number of months for this option
         */
        public SupportOption(String code, Decimal monthlyAmount, Integer months) {
            this.code = code;
            this.monthlyAmount = monthlyAmount;
            this.months = months;
            this.totalAmount = monthlyAmount * months;
        }
    }

    /**
     * @description Get support option configuration by code
     * @param optionCode The option code (BASIC, STANDARD, PREMIUM)
     * @return SupportOption - the configuration for the option
     * @throws GrantApplicationException if option code is invalid
     */
    public static SupportOption getOptionConfig(String optionCode) {
        SupportOption option = OPTIONS.get(optionCode);
        if (option == null) {
            throw new GrantApplicationException('Invalid support option: ' + optionCode);
        }
        return option;
    }

    /**
     * @description Get all available support options
     * @return Map of support option codes to SupportOption objects
     */
    public static Map<String, SupportOption> getAllOptions() {
        return OPTIONS;
    }
}
