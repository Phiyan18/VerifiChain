// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CredentialRegistry {
    
    struct Credential {
        string studentId;
        string studentName;
        string degree;
        string major;
        uint256 issueDate;
        string ipfsHash;  // Document stored on IPFS
        bool isRevoked;
        address issuer;
    }
    
    // Mapping: credentialId => Credential
    mapping(bytes32 => Credential) public credentials;
    
    // Mapping: university address => authorized status
    mapping(address => bool) public authorizedIssuers;
    
    address public admin;
    
    // Events
    event CredentialIssued(bytes32 indexed credentialId, string studentId);
    event CredentialRevoked(bytes32 indexed credentialId);
    event IssuerAuthorized(address indexed issuer);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedIssuers[msg.sender], "Not authorized");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }
    
    // Authorize university to issue credentials
    function authorizeIssuer(address _issuer) public onlyAdmin {
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer);
    }
    
    // Issue a credential
    function issueCredential(
        string memory _studentId,
        string memory _studentName,
        string memory _degree,
        string memory _major,
        string memory _ipfsHash
    ) public onlyAuthorized returns (bytes32) {
        
        bytes32 credentialId = keccak256(
            abi.encodePacked(_studentId, _degree, block.timestamp)
        );
        
        require(credentials[credentialId].issueDate == 0, "Credential already exists");
        
        credentials[credentialId] = Credential({
            studentId: _studentId,
            studentName: _studentName,
            degree: _degree,
            major: _major,
            issueDate: block.timestamp,
            ipfsHash: _ipfsHash,
            isRevoked: false,
            issuer: msg.sender
        });
        
        emit CredentialIssued(credentialId, _studentId);
        return credentialId;
    }
    
    // Verify a credential
    function verifyCredential(bytes32 _credentialId) 
        public 
        view 
        returns (
            string memory studentName,
            string memory degree,
            string memory major,
            uint256 issueDate,
            bool isValid
        ) 
    {
        Credential memory cred = credentials[_credentialId];
        require(cred.issueDate != 0, "Credential does not exist");
        
        return (
            cred.studentName,
            cred.degree,
            cred.major,
            cred.issueDate,
            !cred.isRevoked
        );
    }
    
    // Revoke a credential (in case of fraud)
    function revokeCredential(bytes32 _credentialId) public onlyAuthorized {
        require(credentials[_credentialId].issueDate != 0, "Credential does not exist");
        credentials[_credentialId].isRevoked = true;
        emit CredentialRevoked(_credentialId);
    }
}