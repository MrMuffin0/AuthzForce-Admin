var policyObject = {
    "Policy": {
        "Id": "",
        "Version": "",
        "CombinerId": "urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-unless-permit",
        "Desc": "",
        "Target": [],
        "Vars": [],
        "CombinerArgs": [
            {
                "Policy": {
                    "Id": "",
                    "Version": "",
                    "CombinerId": "urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-unless-permit",
                    "Desc": "",
                    "Target": [
                        [
                            [
                                {
                                    "MatchFunc": "urn:oasis:names:tc:xacml:1.0:function:string-equal",
                                    "MatchedValue": "",
                                    "AttributeDesignator": {
                                        "Category": "urn:oasis:names:tc:xacml:3.0:attribute-category:resource",
                                        "AttributeId": "urn:oasis:names:tc:xacml:1.0:resource:resource-id",
                                        "DataType": "http://www.w3.org/2001/XMLSchema#string",
                                        "MustBePresent": true
                                    }
                                }
                            ]
                        ]
                    ],
                    "Vars": [],
                    "CombinerArgs": [
                        {
                            "Rule": {
                                "Id": "",
                                "Effect": "",
                                "Desc": "",
                                "Target": [
                                    [
                                        [
                                            {
                                                "MatchFunc": "urn:oasis:names:tc:xacml:1.0:function:string-equal",
                                                "MatchedValue": "",
                                                "AttributeDesignator": {
                                                    "Category": "urn:oasis:names:tc:xacml:3.0:attribute-category:resource",
                                                    "AttributeId": "urn:thales:xacml:2.0:resource:sub-resource-id",
                                                    "DataType": "http://www.w3.org/2001/XMLSchema#string",
                                                    "MustBePresent": true
                                                }
                                            }
                                        ]
                                    ],
                                    [
                                        [
                                            {
                                                "MatchFunc": "urn:oasis:names:tc:xacml:1.0:function:string-equal",
                                                "MatchedValue": "",
                                                "AttributeDesignator": {
                                                    "Category": "urn:oasis:names:tc:xacml:3.0:attribute-category:action",
                                                    "AttributeId": "urn:oasis:names:tc:xacml:1.0:action:action-id",
                                                    "DataType": "http://www.w3.org/2001/XMLSchema#string",
                                                    "MustBePresent": true
                                                }
                                            }
                                        ]
                                    ]
                                ],
                                "Condition": {
                                    "FuncCall": {
                                        "FuncId": "urn:oasis:names:tc:xacml:3.0:function:any-of",
                                        "ArgExprs": [
                                            {
                                                "Func": "urn:oasis:names:tc:xacml:1.0:function:string-equal"
                                            },
                                            {
                                                "Const": {
                                                    "Value": "",
                                                    "DataType": "http://www.w3.org/2001/XMLSchema#string"
                                                }
                                            },
                                            {
                                                "AttributeDesignator": {
                                                    "Category": "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject",
                                                    "AttributeId": "urn:oasis:names:tc:xacml:2.0:subject:role",
                                                    "DataType": "http://www.w3.org/2001/XMLSchema#string",
                                                    "MustBePresent": false
                                                }
                                            }
                                        ]
                                    }
                                },
                                "PepActionExprs": []
                            }
                        }
                    ],
                    "PepActionExprs": []
                }
            }
        ],
        "PepActionExprs": []
    }
}