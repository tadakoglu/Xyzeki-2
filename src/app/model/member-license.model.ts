export class MemberLicense {
    constructor(
        public LicenseType: string, // Bireysel ya da Kurumsal
        public Username: string,
        public AzureSaConnectionString: string,
        public AzureSaSizeInGb: number, // Bireysel için 1 GB, Kurumsal için 1 GB X Çalışan Sayısı      

        public StartDate: string,
        public EndDate: string,
        public Fee: number,
        public Currency: string,


        public Company: string, // TAYFUN ADAKOĞLU VEYA XYZEKİ ANONİM ŞİRKETİ GİBİ 
        public NumberOfEmployees: number,
        public TaxNumber?: number,
        public Address?: string,
        public LicenseId?: string // Auto generated from SQL Server
    ) { }


    // Azure Storage Account Name = tadakoglu(username)
    // Azure Storage Account Container Name = tadakoglu(same, username)
    // Azure Storage Account Key = G176lDXKsN1joI6yL9...(differenciating)

    //Storage account names must be between 3 and 24 characters in length and use numbers and lower-case letters only. The name must be unique.
    //A blob container name must be between 3 and 63 characters in length; start with a letter or number; and contain only letters, numbers, and the hyphen. All letters used in blob container names must be lowercase. Lowercase is required because using mixed-case letters in container names may be problematic
}
