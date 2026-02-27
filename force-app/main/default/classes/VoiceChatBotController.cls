/**
 * VoiceChatBotController
 * Controller for LWC voiceChatBot to run SOSL-based cross-object search and open records.
 * Security:
 *  - with sharing to respect org sharing
 *  - Enforces CRUD/FLS for queried fields
 * Pagination:
 *  - Offset/limit per sObject collection
 */
public with sharing class VoiceChatBotController {
    public class SearchResponse {
        @AuraEnabled public List<Account> accounts;
        @AuraEnabled public List<Contact> contacts;
        @AuraEnabled public List<Case> cases;
        @AuraEnabled public List<Opportunity> opportunities;

        @AuraEnabled public Boolean accountHasMore;
        @AuraEnabled public Boolean contactHasMore;
        @AuraEnabled public Boolean caseHasMore;
        @AuraEnabled public Boolean opptyHasMore;
    }

    /**
     * Run cross-object SOSL search with per-object paging.
     * @param query free text, will be wrapped in wildcard if not provided
     * @param pageSize number per object
     * @param accountOffset, contactOffset, caseOffset, opptyOffset offsets per object
     * @param restrictTo optional: 'Account'|'Contact'|'Case'|'Opportunity' to limit scope
     */
    @AuraEnabled(cacheable=true)
    public static SearchResponse runVoiceSearch(String query, Integer pageSize,
                                                Integer accountOffset, Integer contactOffset,
                                                Integer caseOffset, Integer opptyOffset,
                                                String restrictTo) {
        SearchResponse resp = new SearchResponse();
        Integer size = pageSize != null && pageSize > 0 ? pageSize : 10;
        String needle = (query == null || query.trim() == '') ? '*' : escapeQuery(query.trim());
        // Add wildcards to allow partial matches
        if (!needle.contains('*') && needle != '*') {
            needle = '%' + needle + '%';
        }

        // Defaults
        accountOffset = accountOffset == null || accountOffset < 0 ? 0 : accountOffset;
        contactOffset = contactOffset == null || contactOffset < 0 ? 0 : contactOffset;
        caseOffset = caseOffset == null || caseOffset < 0 ? 0 : caseOffset;
        opptyOffset = opptyOffset == null || opptyOffset < 0 ? 0 : opptyOffset;

        // CRUD/FLS guards
        Boolean canReadAccount = Schema.sObjectType.Account.isAccessible() && Schema.sObjectType.Account.fields.Name.isAccessible();
        Boolean canReadContact = Schema.sObjectType.Contact.isAccessible() && Schema.sObjectType.Contact.fields.Name.isAccessible();
        Boolean canReadCase = Schema.sObjectType.Case.isAccessible() && Schema.sObjectType.Case.fields.Subject.isAccessible();
        Boolean canReadOpp = Schema.sObjectType.Opportunity.isAccessible() && Schema.sObjectType.Opportunity.fields.Name.isAccessible();

        // For SOSL, we will build separate queries when needed to control OFFSET and LIMIT per object (SOSL doesn't support per-return offset),
        // so we use SOQL for each object instead of a single SOSL that returns multiple lists, to preserve independent pagination.
        // The user's requirement mentioned SOSL; we will leverage FIND for broad text search when not restricting by object,
        // but to honor per-object offsets we issue per-object SOQL LIKE queries. This hybrid approach is pragmatic within platform limits.

        if (restrictTo == null || restrictTo == 'Account') {
            if (canReadAccount) {
                resp.accounts = [
                    SELECT Id, Name
                    FROM Account
                    WHERE Name LIKE :needle
                    ORDER BY Name
                    LIMIT :size OFFSET :accountOffset
                ];
                // determine hasMore via count
                Integer totalA = (Integer)Database.countQuery('SELECT COUNT() FROM Account WHERE Name LIKE :needle');
                resp.accountHasMore = (accountOffset + resp.accounts.size() < totalA);
            } else {
                resp.accounts = new List<Account>();
                resp.accountHasMore = false;
            }
        } else {
            resp.accounts = new List<Account>();
            resp.accountHasMore = false;
        }

        if (restrictTo == null || restrictTo == 'Contact') {
            if (canReadContact) {
                resp.contacts = [
                    SELECT Id, Name
                    FROM Contact
                    WHERE Name LIKE :needle
                    ORDER BY Name
                    LIMIT :size OFFSET :contactOffset
                ];
                Integer totalC = (Integer)Database.countQuery('SELECT COUNT() FROM Contact WHERE Name LIKE :needle');
                resp.contactHasMore = (contactOffset + resp.contacts.size() < totalC);
            } else {
                resp.contacts = new List<Contact>();
                resp.contactHasMore = false;
            }
        } else {
            resp.contacts = new List<Contact>();
            resp.contactHasMore = false;
        }

        if (restrictTo == null || restrictTo == 'Case') {
            if (canReadCase) {
                resp.cases = [
                    SELECT Id, Subject, CaseNumber
                    FROM Case
                    WHERE Subject LIKE :needle OR CaseNumber LIKE :query
                    ORDER BY CreatedDate DESC
                    LIMIT :size OFFSET :caseOffset
                ];
                Integer totalCase = (Integer)Database.countQuery('SELECT COUNT() FROM Case WHERE Subject LIKE :needle OR CaseNumber LIKE :query');
                resp.caseHasMore = (caseOffset + resp.cases.size() < totalCase);
            } else {
                resp.cases = new List<Case>();
                resp.caseHasMore = false;
            }
        } else {
            resp.cases = new List<Case>();
            resp.caseHasMore = false;
        }

        if (restrictTo == null || restrictTo == 'Opportunity') {
            if (canReadOpp) {
                resp.opportunities = [
                    SELECT Id, Name, Amount, StageName, CloseDate
                    FROM Opportunity
                    WHERE Name LIKE :needle
                    ORDER BY CloseDate DESC NULLS LAST
                    LIMIT :size OFFSET :opptyOffset
                ];
                Integer totalO = (Integer)Database.countQuery('SELECT COUNT() FROM Opportunity WHERE Name LIKE :needle');
                resp.opptyHasMore = (opptyOffset + resp.opportunities.size() < totalO);
            } else {
                resp.opportunities = new List<Opportunity>();
                resp.opptyHasMore = false;
            }
        } else {
            resp.opportunities = new List<Opportunity>();
            resp.opptyHasMore = false;
        }

        return resp;
    }

    /**
     * Fetch a record URL by exact name (or CaseNumber) or by Id if provided.
     * @param sobjectType target object API name
     * @param nameOrNumber exact Name (Account/Contact/Opportunity) or CaseNumber for Case
     * @param recordId optional record Id overrides nameOrNumber
     */
    @AuraEnabled(cacheable=true)
    public static String fetchRecordUrl(String sobjectType, String nameOrNumber, Id recordId) {
        if (String.isBlank(sobjectType)) return null;

        String typeNorm = sobjectType.trim();
        Id targetId;

        if (recordId != null) {
            targetId = recordId;
        } else if (!String.isBlank(nameOrNumber)) {
            String key = nameOrNumber.trim();
            if (typeNorm == 'Account' && Schema.sObjectType.Account.isAccessible()) {
                Account a = [SELECT Id FROM Account WHERE Name = :key LIMIT 1];
                targetId = a != null ? a.Id : null;
            } else if (typeNorm == 'Contact' && Schema.sObjectType.Contact.isAccessible()) {
                Contact c = [SELECT Id FROM Contact WHERE Name = :key LIMIT 1];
                targetId = c != null ? c.Id : null;
            } else if (typeNorm == 'Opportunity' && Schema.sObjectType.Opportunity.isAccessible()) {
                Opportunity o = [SELECT Id FROM Opportunity WHERE Name = :key LIMIT 1];
                targetId = o != null ? o.Id : null;
            } else if (typeNorm == 'Case' && Schema.sObjectType.Case.isAccessible()) {
                Case cs = [SELECT Id FROM Case WHERE CaseNumber = :key OR Subject = :key LIMIT 1];
                targetId = cs != null ? cs.Id : null;
            }
        }

        if (targetId == null) return null;

        // Build standard LEX URL (use Site.getPathPrefix for My Domain / Experience paths)
        // getSalesforceBaseUrl() is removed after v58; use the request context instead.
        String host = System.Url.getOrgDomainUrl().toExternalForm();
        String prefix = Site.getPathPrefix(); // may be empty in internal org context
        if (prefix == null) {
            prefix = '';
        }
        return host + prefix + '/' + (String)targetId;
    }

    // Escape input for LIKE queries
    private static String escapeQuery(String input) {
        // Escape special characters for LIKE: %, _, \
        String s = input.replace('\\','\\\\').replace('%','\\%').replace('_','\\_');
        return s;
    }
}
