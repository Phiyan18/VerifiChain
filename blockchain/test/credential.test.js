const CredentialRegistry = artifacts.require("CredentialRegistry");

contract("CredentialRegistry", (accounts) => {
    let registry;
    const admin = accounts[0];
    const university = accounts[1];
    
    before(async () => {
        registry = await CredentialRegistry.deployed();
    });
    
    it("should authorize issuer", async () => {
        await registry.authorizeIssuer(university, { from: admin });
        const isAuthorized = await registry.authorizedIssuers(university);
        assert.equal(isAuthorized, true);
    });
    
    it("should issue credential", async () => {
        const result = await registry.issueCredential(
            "STU001",
            "John Doe",
            "Bachelor of Technology",
            "Computer Science",
            "QmHash123...",
            { from: university }
        );
        assert.ok(result.logs[0].event === "CredentialIssued");
    });
});