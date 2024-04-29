//Define constants and variables
const ruleEffects = ["Permit","Deny"];
var policyFormJson = null;
var versionRegExp = new RegExp('\\d|\\.');

//Only allow numbers and a decimal point to be typed.
function restrictInputChars(event) {
    /*
     * Line A: Don't do anything if the Control or Alt keys are pressed down,
     * as we don't want to prevent the user from using keyboard shortcuts.
     * 
     * Line B: Make sure we're only handling strings, as those are the only
     * type of value that we are expecting.
     *
     * Line C: We only need to filter out single characters. This is important
     * because it allows us to continue using keys such as Home, End, and
     * Enter, all of which are useful for maneuvering the form, and all of which
     * are longer than 1 character.
     */
    if(event.ctrlKey // (A)
    || event.altKey // (A)
    || typeof event.key !== 'string' // (B)
    || event.key.length !== 1) { // (C)
        return;
    }
    
    if(!versionRegExp.test(event.key)) {
        console.log(1);
        event.preventDefault();
    }
}

//ToDo: Implement form validation before submit event to ensure valid XML format before installation.
function validateInput(event) {
    //Get all inputs in the form we specifically are looking at, this selector can be
    //changed if this is supposed to be applied to specific inputs
    var forbiddenChars = "/[^a-z\d\-]/ig";
    let formDataPolicy = new FormData(event.target);

    //check all the inputs we selected
    for(var data of formDataPolicy.entries()) {
        console.log(data[0] + " " + data[1]);
        //Check that there aren't any forbidden chars
        if(forbiddenChars.test(data[1]) && data[1] !== "psVersion" || data[1] !== "pVersion") {
            //This line is just to do something on a failure for Stackoverflow
            //I suggest removing this and doing something different in application
            console.log('Entry ' + data[0] + ' has forbidden chars.');
            event.preventDefault();
            //Do stuff here

            //Prevent submit even propagation (don't submit)
            return false;
        }
        else {
            handleAddPolicySubmit(event);
        }
    }
}

//Get data from the form input elements and add them to a template policy JSON object.
function handleAddPolicySubmit(event) {
    //Handle data from policy form
    event.preventDefault();

    //let psId = document.getElementById("psId");

    let formDataPolicy = new FormData(event.target);
    
    let psId = formDataPolicy.get("psId");
    let psVersion = formDataPolicy.get("psVersion");
    let psDescription = formDataPolicy.get("psDescription");
    let psCombinerId = formDataPolicy.get("psCombinerId");
    let pId = formDataPolicy.get("pId");
    let pVersion = formDataPolicy.get("pVersion");
    let pDescription = formDataPolicy.get("pDescription");
    let pCombinerId = formDataPolicy.get("pCombinerId");
    let pResource1 = formDataPolicy.get("pResource1");
    let rDescription1 = formDataPolicy.get("rDescription1");
    let rId1 = formDataPolicy.get("rId1");
    let rEffect1 = formDataPolicy.get("rEffect1");
    let rTarget1 = formDataPolicy.get("rTarget1");
    let rAction1 = formDataPolicy.get("rAction1");
    let rFunction1 = formDataPolicy.get("rFunction1");
    let rRole1 = formDataPolicy.get("rRole1");
    let rCategory1 = formDataPolicy.get("rCategory1");
    let rAttributeId1 = formDataPolicy.get("rAttributeId1");
    //console.log(...formDataPolicy);

    var policySet = policyObject;
    console.log(policySet);
    console.log(psId);
    policySet.Policy.Id = psId;
    console.log(psVersion);
    policySet.Policy.Version = psVersion;
    //console.log(psCombinerId);
    //policySet.Policy.CombinerId = psCombinerId;
    console.log(psDescription);
    policySet.Policy.Desc = psDescription;
    console.log(pId);
    policySet.Policy.CombinerArgs[0].Policy.Id = pId;
    console.log(pVersion);
    policySet.Policy.CombinerArgs[0].Policy.Version = pVersion;
    console.log(pDescription);
    policySet.Policy.CombinerArgs[0].Policy.Desc = pDescription;
    console.log(pResource1);
    policySet.Policy.CombinerArgs[0].Policy.Target[0][0][0].MatchedValue = pResource1;
    console.log(rDescription1);
    policySet.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Desc = rDescription1;
    console.log(rId1);
    policySet.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Id = rId1;
    console.log(rEffect1);
    policySet.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Effect = rEffect1;
    console.log(rTarget1);
    policySet.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Target[0][0][0].MatchedValue = rTarget1;
    console.log(rAction1);
    policySet.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Target[1][0][0].MatchedValue = rAction1;
    console.log(rRole1);
    policySet.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Condition.FuncCall.ArgExprs[1].Const.Value = rRole1;

    console.log(policySet);
    policyFormJson = policySet;
    return policyFormJson;
}

//Transform the JSON policy object to valid XML and make a POST API call to install the policy.
function installPolicy(input) {
    //First the JSON object with the form data is transformed to XML.
    let policyData = transformJsonToXml(input);

    //Output the transformation result
    console.log(policyData);

    //Fetch POST API call to send XML to AuthzForce server
    fetchPostPolicy(policyData);

    //Show modal success if HTTP return is 200
    buildPolicyTable();
}

//-- TODO: Remake with Bootstrap CSS
//Modify a policy: Initialize the form and add the elements
async function createModifyPolicyForm(input = null) {
    if (!document.getElementById("policyForm")) {
        //Assign view to div
        let policyView = document.getElementById("mainCard");
        var policyForm = document.createElement("form");
        policyForm.setAttribute("id", "policyForm");

        //Grab JSON test data
        /*const response = await fetch(input);
        const data = await response.json();
        console.log(data);*/
        const data = input;

        //Delete current content of div
        while (policyView.firstChild) {
            policyView.removeChild(policyView.firstChild);
        };

        //Take form and append it to the view
        policyView.appendChild(policyForm);

        //Create policy set fieldset
        const fieldSetPolicySet = document.createElement("fieldset");
        fieldSetPolicySet.setAttribute("id", "fieldSetPolicySet");
        var fspsLegend = document.createElement("legend");
        fspsLegend.innerText = "Policy Set";
        fieldSetPolicySet.appendChild(fspsLegend);

        let fsParagraph = document.createElement("p");
        let fsLabel = document.createElement("label");
        let fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "psId");
        fsLabel.innerText = "Policy Set ID";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "psId");
        fsInput.setAttribute("id", "psId");
        fsInput.setAttribute("value", data.Policy.Id);
        //fsInput.setAttribute("disabled", "true");
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicySet.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicySet);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "psVersion");
        fsLabel.innerText = "Version";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "psVersion");
        fsInput.setAttribute("id", "psVersion");
        fsInput.setAttribute("pattern", "[0-9]{1}.[0-9]{1}");
        fsInput.setAttribute("required", "true");
        fsInput.setAttribute("placeholder", "1.0");
        let fsInputData = parseFloat(data.Policy.Version, 10);
        console.log("PS Version: "+fsInputData);
        fsInputData += 0.1;
        fsInputData = Math.round(fsInputData * 10) / 10;
        fsInput.setAttribute("value", fsInputData);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicySet.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicySet);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "psDescription");
        fsLabel.innerText = "Description";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "psDescription");
        fsInput.setAttribute("id", "psDescription");
        fsInput.setAttribute("value", data.Policy.Desc);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicySet.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicySet);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "psCombinerId");
        fsLabel.innerText = "Combiner";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "psCombinerId");
        fsInput.setAttribute("id", "psCombinerId");
        fsInput.setAttribute("disabled", "true");
        fsInput.setAttribute("placeholder", policyObject.Policy.CombinerId);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicySet.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicySet);

        //Create policy fieldset
        const fieldSetPolicy = document.createElement("fieldset");
        fieldSetPolicy.setAttribute("id", "fieldSetPolicy1");
        var fspLegend = document.createElement("legend");
        fspLegend.innerText = "Policy 1";
        fieldSetPolicy.appendChild(fspLegend);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "pId");
        fsLabel.innerText = "Policy ID";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "pId");
        fsInput.setAttribute("id", "pId");
        fsInput.setAttribute("value", data.Policy.CombinerArgs[0].Policy.Id);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicy.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicy);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "pVersion");
        fsLabel.innerText = "Version";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "pVersion");
        fsInput.setAttribute("id", "pVersion");
        fsInput.setAttribute("pattern", "[0-9]{1}.[0-9]{1}");
        fsInput.setAttribute("required", "true");
        fsInput.setAttribute("placeholder", "1.0");
        fsInputData = parseInt(data.Policy.CombinerArgs[0].Policy.Version, 10);
        console.log("P Version: "+fsInputData);
        fsInputData += 0.1;
        fsInputData = Math.round(fsInputData * 10) / 10;
        fsInput.setAttribute("value", fsInputData);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicy.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicy);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "pDescription");
        fsLabel.innerText = "Description";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "pDescription");
        fsInput.setAttribute("id", "pDescription");
        fsInput.setAttribute("value", data.Policy.CombinerArgs[0].Policy.Desc);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicy.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicy);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "pCombinerId");
        fsLabel.innerText = "Combiner";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "pCombinerId");
        fsInput.setAttribute("id", "pCombinerId");
        fsInput.setAttribute("disabled", "true");
        fsInput.setAttribute("placeholder", policyObject.Policy.CombinerArgs[0].Policy.CombinerId);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicy.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicy);

        //Create policy target fieldset
        const fieldSetPolicyTarget = document.createElement("fieldset");
        fieldSetPolicyTarget.setAttribute("id", "fieldSetPolicyTarget");
        var fspLegend = document.createElement("legend");
        fspLegend.innerText = "Policy Target";
        fieldSetPolicyTarget.appendChild(fspLegend);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "pResource1");
        fsLabel.innerText = "Resource ID";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "pResource1");
        fsInput.setAttribute("id", "pResource1");
        fsInput.setAttribute("value", data.Policy.CombinerArgs[0].Policy.Target[0][0][0].MatchedValue);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyTarget.appendChild(fsParagraph);
        fieldSetPolicy.appendChild(fieldSetPolicyTarget);
        
        //Create policy rule fieldset
        const fieldSetPolicyRule1 = document.createElement("fieldset");
        fieldSetPolicyRule1.setAttribute("id", "fieldSetPolicyTarget");
        var fspLegend = document.createElement("legend");
        fspLegend.innerText = "Policy Rule 1";
        fieldSetPolicyTarget.appendChild(fspLegend);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rDescription1");
        fsLabel.innerText = "Description";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rDescription1");
        fsInput.setAttribute("id", "rDescription1");
        fsInput.setAttribute("value", data.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Desc);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1.appendChild(fsParagraph);
        fieldSetPolicy.appendChild(fieldSetPolicyRule1);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rId1");
        fsLabel.innerText = "ID";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rId1");
        fsInput.setAttribute("id", "rId1");
        fsInput.setAttribute("value", data.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Id);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1.appendChild(fsParagraph);
        fieldSetPolicy.appendChild(fieldSetPolicyRule1);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsSelect = document.createElement("select");
        fsLabel.setAttribute("for", "rEffect1");
        fsLabel.innerText = "Effect";
        fsSelect.setAttribute("type", "text");
        fsSelect.setAttribute("name", "rEffect1");
        fsSelect.setAttribute("id", "rEffect1");
        for (var i = 0; i < ruleEffects.length; i++) {
            var option = document.createElement("option");
            option.value = ruleEffects[i];
            option.text = ruleEffects[i];
            fsSelect.appendChild(option);
        };
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsSelect);
        fieldSetPolicyRule1.appendChild(fsParagraph);
        fieldSetPolicy.appendChild(fieldSetPolicyRule1);

        //Create policy rule target fieldset
        const fieldSetPolicyRule1Target = document.createElement("fieldset");
        fieldSetPolicyRule1Target.setAttribute("id", "fieldSetPolicyTarget");
        var fspLegend = document.createElement("legend");
        fspLegend.innerText = "Rule 1 Target";
        fieldSetPolicyRule1Target.appendChild(fspLegend);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rTarget1");
        fsLabel.innerText = "Rule Target";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rTarget1");
        fsInput.setAttribute("id", "rTarget1");
        fsInput.setAttribute("value", data.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Target[0][0][0].MatchedValue);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rAction1");
        fsLabel.innerText = "Target Action";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rAction1");
        fsInput.setAttribute("id", "rAction1");
        fsInput.setAttribute("value", data.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Target[1][0][0].MatchedValue);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1Target.appendChild(fsParagraph);
        fieldSetPolicyRule1.appendChild(fieldSetPolicyRule1Target);

        //Create policy condition fieldset
        const fieldSetPolicyRule1Condition = document.createElement("fieldset");
        fieldSetPolicyRule1Condition.setAttribute("id", "fieldSetPolicyTarget");
        var fspLegend = document.createElement("legend");
        fspLegend.innerText = "Rule 1 Condition";
        fieldSetPolicyRule1Condition.appendChild(fspLegend);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rFunction1");
        fsLabel.innerText = "Function";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rFunction1");
        fsInput.setAttribute("id", "rFunction1");
        fsInput.setAttribute("disabled", "true");
        fsInput.setAttribute("placeholder", policyObject.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Condition.FuncCall.FuncId);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1Condition.appendChild(fsParagraph);
        fieldSetPolicyRule1.appendChild(fieldSetPolicyRule1Condition);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rRole1");
        fsLabel.innerText = "Role Name";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rRole1");
        fsInput.setAttribute("id", "rRole1");
        fsInput.setAttribute("value", data.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Condition.FuncCall.ArgExprs[1].Const.Value);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1Condition.appendChild(fsParagraph);
        fieldSetPolicyRule1.appendChild(fieldSetPolicyRule1Condition);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rCategory1");
        fsLabel.innerText = "Category";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rCategory1");
        fsInput.setAttribute("id", "rCategory1");
        fsInput.setAttribute("disabled", "true");
        fsInput.setAttribute("placeholder", policyObject.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Condition.FuncCall.ArgExprs[2].AttributeDesignator.Category);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1Condition.appendChild(fsParagraph);
        fieldSetPolicyRule1.appendChild(fieldSetPolicyRule1Condition);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rAttributeId1");
        fsLabel.innerText = "Attribute ID";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rAttributeId1");
        fsInput.setAttribute("id", "rAttributeId1");
        fsInput.setAttribute("disabled", "true");
        fsInput.setAttribute("placeholder", policyObject.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Condition.FuncCall.ArgExprs[2].AttributeDesignator.AttributeId);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1Condition.appendChild(fsParagraph);
        fieldSetPolicyRule1.appendChild(fieldSetPolicyRule1Condition);

        //Create save button
        let btnPolicySave = document.createElement("button");
        btnPolicySave.setAttribute("class", "btn btn-primary me-1");
        btnPolicySave.setAttribute("id", "btnPolicySave");
        btnPolicySave.innerText = "Save policy";
        policyForm.appendChild(btnPolicySave);

        //Create install button
        let btnInstallPolicy = document.createElement("button");
        btnInstallPolicy.setAttribute("type", "button");
        btnInstallPolicy.setAttribute("class", "btn btn-success me-1");
        btnInstallPolicy.setAttribute("id", "btnInstallPolicy");
        btnInstallPolicy.innerText = "Install policy";
        policyForm.appendChild(btnInstallPolicy);

        //Create cancel button
        let btnCancel = document.createElement("button");
        btnCancel.setAttribute("type", "button");
        btnCancel.setAttribute("class", "btn btn-secondary me-1");
        btnCancel.setAttribute("id", "btnCancel");
        btnCancel.innerText = "Cancel";
        policyForm.appendChild(btnCancel);

        //Which policy was selected for modification?
        let psIdOriginal = data.Policy.Id;
        let psVersionOriginal = data.Policy.Version;

        policyForm.querySelector('form');
        policyForm.addEventListener('submit', handleAddPolicySubmit);
        btnInstallPolicy.addEventListener('click', () => {
            installPolicy(policyFormJson);
        });
        btnCancel.addEventListener('click', () => {
            displayPolicyElement(data);
        });

        var psVersionInput = document.getElementById('psVersion');
        var pVersionInput = document.getElementById('pVersion');
        psVersionInput.addEventListener('keydown', () => { restrictInputChars(event) });
        pVersionInput.addEventListener('keydown', () => { restrictInputChars(event) });
    };
}

//Build list of installed policies
async function buildPolicyTable() {
    let view = document.getElementById("mainCard");
    //Delete current content of div
    while (view.firstChild) {
        view.removeChild(view.firstChild);
    };

    //Check if table is already there and create one if not.
    if (!document.getElementById("policyListTableBody")) {
        let mainCard = document.getElementById("mainCard");
        //Card title
        let newElement = document.createElement("h5");
        newElement.setAttribute("class", "card-title");
        newElement.innerText = "Installed Policies";
        mainCard.appendChild(newElement);
        //Create table
        let newTable = document.createElement("table");
        newTable.setAttribute("class", "table table-striped");
        newTable.setAttribute("id", "policyListTable");
        mainCard.appendChild(newTable);
        //Create table column headers
        let newTableHead = document.createElement("thead");
        let newTRow = document.createElement("tr");
        let newTRCell = document.createElement("th");
        newTRCell.setAttribute("scope", "col");
        newTRCell.innerText = "#";
        newTRow.appendChild(newTRCell);
        newTRCell = document.createElement("th");
        newTRCell.setAttribute("scope", "col");
        newTRCell.innerText = "Policy Set";
        newTRow.appendChild(newTRCell);
        newTRCell = document.createElement("th");
        newTRCell.setAttribute("scope", "col");
        newTRCell.innerText = "Version";
        newTRow.appendChild(newTRCell);
        newTRCell = document.createElement("th");
        newTRCell.setAttribute("scope", "col");
        newTRCell.innerText = "Description";
        newTRow.appendChild(newTRCell);
        newTableHead.appendChild(newTRow);
        newTable.appendChild(newTableHead);
        //Create table body
        newTableBody = document.createElement("tbody");
        newTableBody.setAttribute("id", "policyListTableBody");
        newTable.appendChild(newTableBody);
        mainCard.appendChild(newTable);
    }
    
    //This is the table we want to add rows with policy information to.
    let policyListTable = document.getElementById("policyListTableBody");

    //Get list of installed policies.
    let policyList = await fetchPoliciesList();
    console.log(policyList);
    parser = new DOMParser();
    let xmlDoc = parser.parseFromString(policyList,"text/xml");
    
    //Iterate through all elements and create a table row with Policy Set information
    for (let i=0; i<xmlDoc.childNodes[0].childNodes.length; i++) {
        console.log(xmlDoc.childNodes[0].childNodes[i].attributes[1].nodeValue);
        let psId = xmlDoc.childNodes[0].childNodes[i].attributes[1].nodeValue;
        
        //Get policy set with id psId
        let psElement = await fetchPolicy(psId);
        parser = new DOMParser();
        let psElementXml = parser.parseFromString(psElement,"text/xml");
        let psElementVersionLatest = psElementXml.childNodes[0].firstChild.attributes[1].nodeValue;

        //Get latest version of Policy Set
        let psLatest = await fetchPolicy(psId, psElementVersionLatest);
        parser = new DOMParser();
        let psLatestXml = parser.parseFromString(psLatest,"text/xml");
        
        //Get the CombiningAlgId and slice off "urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:"
        let policyCombiningAlgId = psLatestXml.childNodes[0].attributes[7].nodeValue;
        policyCombiningAlgId = policyCombiningAlgId.slice(56);

        //Get the Policy Set Description
        let psLatestXmlDesc = psLatestXml.childNodes[0].childNodes[0].innerHTML;
        
        //Create the table with the policy information.
        let policyListTableRow = document.createElement("tr");
        policyListTableRow.setAttribute("id", "policyListTableRow"+i);
        let policyListTableRowCell = document.createElement("th");
        policyListTableRowCell.setAttribute("scope", "row");        
        policyListTableRowCell.innerText = i+1;
        policyListTableRow.appendChild(policyListTableRowCell);
        policyListTableRowCell = document.createElement("td");
        policyListTableRowCell.innerText = psId;
        policyListTableRow.appendChild(policyListTableRowCell);
        policyListTableRowCell = document.createElement("td");
        policyListTableRowCell.innerText = psElementVersionLatest;
        policyListTableRow.appendChild(policyListTableRowCell);
        policyListTableRowCell = document.createElement("td");
        policyListTableRowCell.innerText = psLatestXmlDesc;
        policyListTableRow.appendChild(policyListTableRowCell);
        policyListTableRowCell = document.createElement("td");
        policyListTableRowCell.innerText = policyCombiningAlgId;
        policyListTableRow.appendChild(policyListTableRowCell);
        policyListTable.appendChild(policyListTableRow);
        let policyListTableRowLink = document.createElement("a");

        let policyListTableRowClick = document.getElementById("policyListTableRow"+i);
        policyListTableRowClick.addEventListener('click', () => {
            getPolicyElements(psId, psElementVersionLatest);
        });
        //<a href="#" class="btn btn-primary stretched-link">Go somewhere</a>
        
    }
}

//-- TODO: Remake with Bootstrap CSS
//Initialize the form and add the elements
function createAddPolicyForm(input = null) {
    if (!document.getElementById("policyForm")) {
        //Assign view to div
        let policyView = document.getElementById("mainCard");
        var policyForm = document.createElement("form");
        policyForm.setAttribute("id", "policyForm");

        //Delete current content of div
        while (policyView.firstChild) {
            policyView.removeChild(policyView.firstChild);
        };

        //Take form and append it to the view
        policyView.appendChild(policyForm);

        //Create policy set fieldset
        const fieldSetPolicySet = document.createElement("fieldset");
        fieldSetPolicySet.setAttribute("id", "fieldSetPolicySet");
        var fspsLegend = document.createElement("legend");
        fspsLegend.innerText = "Policy Set";
        fieldSetPolicySet.appendChild(fspsLegend);

        let fsParagraph = document.createElement("p");
        let fsLabel = document.createElement("label");
        let fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "psId");
        fsLabel.innerText = "Policy Set ID";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "psId");
        fsInput.setAttribute("id", "psId");
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicySet.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicySet);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "psVersion");
        fsLabel.innerText = "Version";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "psVersion");
        fsInput.setAttribute("id", "psVersion");
        fsInput.setAttribute("pattern", "[0-9]{1}.[0-9]{1}");
        fsInput.setAttribute("required", "true");
        fsInput.setAttribute("placeholder", "1.0");
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicySet.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicySet);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "psDescription");
        fsLabel.innerText = "Description";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "psDescription");
        fsInput.setAttribute("id", "psDescription");
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicySet.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicySet);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "psCombinerId");
        fsLabel.innerText = "Combiner";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "psCombinerId");
        fsInput.setAttribute("id", "psCombinerId");
        fsInput.setAttribute("disabled", "true");
        fsInput.setAttribute("placeholder", policyObject.Policy.CombinerId);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicySet.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicySet);

        //Create policy fieldset
        const fieldSetPolicy = document.createElement("fieldset");
        fieldSetPolicy.setAttribute("id", "fieldSetPolicy1");
        var fspLegend = document.createElement("legend");
        fspLegend.innerText = "Policy 1";
        fieldSetPolicy.appendChild(fspLegend);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "pId");
        fsLabel.innerText = "Policy ID";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "pId");
        fsInput.setAttribute("id", "pId");
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicy.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicy);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "pVersion");
        fsLabel.innerText = "Version";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "pVersion");
        fsInput.setAttribute("id", "pVersion");
        fsInput.setAttribute("pattern", "[0-9]{1}.[0-9]{1}");
        fsInput.setAttribute("required", "true");
        fsInput.setAttribute("placeholder", "1.0");
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicy.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicy);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "pDescription");
        fsLabel.innerText = "Description";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "pDescription");
        fsInput.setAttribute("id", "pDescription");
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicy.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicy);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "pCombinerId");
        fsLabel.innerText = "Combiner";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "pCombinerId");
        fsInput.setAttribute("id", "pCombinerId");
        fsInput.setAttribute("disabled", "true");
        fsInput.setAttribute("placeholder", policyObject.Policy.CombinerArgs[0].Policy.CombinerId);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicy.appendChild(fsParagraph);
        policyForm.appendChild(fieldSetPolicy);

        //Create policy target fieldset
        const fieldSetPolicyTarget = document.createElement("fieldset");
        fieldSetPolicyTarget.setAttribute("id", "fieldSetPolicyTarget");
        var fspLegend = document.createElement("legend");
        fspLegend.innerText = "Policy Target";
        fieldSetPolicyTarget.appendChild(fspLegend);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "pResource1");
        fsLabel.innerText = "Resource ID";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "pResource1");
        fsInput.setAttribute("id", "pResource1");
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyTarget.appendChild(fsParagraph);
        fieldSetPolicy.appendChild(fieldSetPolicyTarget);

        //Create policy rule fieldset
        const fieldSetPolicyRule1 = document.createElement("fieldset");
        fieldSetPolicyRule1.setAttribute("id", "fieldSetPolicyTarget");
        var fspLegend = document.createElement("legend");
        fspLegend.innerText = "Policy Rule 1";
        fieldSetPolicyTarget.appendChild(fspLegend);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rDescription1");
        fsLabel.innerText = "Description";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rDescription1");
        fsInput.setAttribute("id", "rDescription1");
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1.appendChild(fsParagraph);
        fieldSetPolicy.appendChild(fieldSetPolicyRule1);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rId1");
        fsLabel.innerText = "ID";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rId1");
        fsInput.setAttribute("id", "rId1");
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1.appendChild(fsParagraph);
        fieldSetPolicy.appendChild(fieldSetPolicyRule1);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsSelect = document.createElement("select");
        fsLabel.setAttribute("for", "rEffect1");
        fsLabel.innerText = "Effect";
        fsSelect.setAttribute("type", "text");
        fsSelect.setAttribute("name", "rEffect1");
        fsSelect.setAttribute("id", "rEffect1");
        for (var i = 0; i < ruleEffects.length; i++) {
            var option = document.createElement("option");
            option.value = ruleEffects[i];
            option.text = ruleEffects[i];
            fsSelect.appendChild(option);
        };
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsSelect);
        fieldSetPolicyRule1.appendChild(fsParagraph);
        fieldSetPolicy.appendChild(fieldSetPolicyRule1);

        //Create policy rule target fieldset
        const fieldSetPolicyRule1Target = document.createElement("fieldset");
        fieldSetPolicyRule1Target.setAttribute("id", "fieldSetPolicyTarget");
        var fspLegend = document.createElement("legend");
        fspLegend.innerText = "Rule 1 Target";
        fieldSetPolicyRule1Target.appendChild(fspLegend);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rTarget1");
        fsLabel.innerText = "Rule Target";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rTarget1");
        fsInput.setAttribute("id", "rTarget1");
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rAction1");
        fsLabel.innerText = "Target Action";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rAction1");
        fsInput.setAttribute("id", "rAction1");
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1Target.appendChild(fsParagraph);
        fieldSetPolicyRule1.appendChild(fieldSetPolicyRule1Target);

        //Create policy condition fieldset
        const fieldSetPolicyRule1Condition = document.createElement("fieldset");
        fieldSetPolicyRule1Condition.setAttribute("id", "fieldSetPolicyTarget");
        var fspLegend = document.createElement("legend");
        fspLegend.innerText = "Rule 1 Condition";
        fieldSetPolicyRule1Condition.appendChild(fspLegend);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rFunction1");
        fsLabel.innerText = "Function";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rFunction1");
        fsInput.setAttribute("id", "rFunction1");
        fsInput.setAttribute("disabled", "true");
        fsInput.setAttribute("placeholder", policyObject.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Condition.FuncCall.FuncId);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1Condition.appendChild(fsParagraph);
        fieldSetPolicyRule1.appendChild(fieldSetPolicyRule1Condition);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rRole1");
        fsLabel.innerText = "Role Name";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rRole1");
        fsInput.setAttribute("id", "rRole1");
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1Condition.appendChild(fsParagraph);
        fieldSetPolicyRule1.appendChild(fieldSetPolicyRule1Condition);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rCategory1");
        fsLabel.innerText = "Category";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rCategory1");
        fsInput.setAttribute("id", "rCategory1");
        fsInput.setAttribute("disabled", "true");
        fsInput.setAttribute("placeholder", policyObject.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Condition.FuncCall.ArgExprs[2].AttributeDesignator.Category);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1Condition.appendChild(fsParagraph);
        fieldSetPolicyRule1.appendChild(fieldSetPolicyRule1Condition);

        fsParagraph = document.createElement("p");
        fsLabel = document.createElement("label");
        fsInput = document.createElement("input");
        fsLabel.setAttribute("for", "rAttributeId1");
        fsLabel.innerText = "Attribute ID";
        fsInput.setAttribute("type", "text");
        fsInput.setAttribute("name", "rAttributeId1");
        fsInput.setAttribute("id", "rAttributeId1");
        fsInput.setAttribute("disabled", "true");
        fsInput.setAttribute("placeholder", policyObject.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Condition.FuncCall.ArgExprs[2].AttributeDesignator.AttributeId);
        fsParagraph.appendChild(fsLabel);
        fsParagraph.appendChild(fsInput);
        fieldSetPolicyRule1Condition.appendChild(fsParagraph);
        fieldSetPolicyRule1.appendChild(fieldSetPolicyRule1Condition);
        
        /*
        //Create Install modal
        let installModal = document.createElement("div");
        installModal.setAttribute("class", "modal fade");
        installModal.setAttribute("id", "installModal");
        installModal.setAttribute("tabindex", "1");
        installModal.setAttribute("style", "display: none;");
        installModal.setAttribute("aria-hidden", "true");
        policyView.appendChild(installModal);
        let modalDialog = document.createElement("div");
        modalDialog.setAttribute("class", "modal-dialog");
        installModal.appendChild(modalDialog);
        let modalContent = document.createElement("div");
        modalContent.setAttribute("class", "modal-content");
        modalDialog.appendChild(modalContent);
        let modalHeader = document.createElement("div");
        modalHeader.setAttribute("class", "modal-header");
        modalContent.appendChild(modalHeader);
        let modalHeaderTitle = document.createElement("h5");
        modalHeaderTitle.setAttribute("class", "modal-title");
        modalHeaderTitle.innerText = "Install Policy";
        modalHeader.appendChild(modalHeaderTitle);
        */

        //Create save button
        let btnPolicySave = document.createElement("button");
        btnPolicySave.setAttribute("type", "submit");
        btnPolicySave.setAttribute("class", "btn btn-primary me-1");
        //btnPolicySave.setAttribute("data-bs-toggle", "modal");
        //btnPolicySave.setAttribute("data-bs-target", "installModal");
        btnPolicySave.setAttribute("id", "btnPolicySave");
        btnPolicySave.innerText = "Save policy";
        policyForm.appendChild(btnPolicySave);

        //Create install button
        let btnInstallPolicy = document.createElement("button");
        btnInstallPolicy.setAttribute("type", "button");
        btnInstallPolicy.setAttribute("class", "btn btn-success");
        btnInstallPolicy.setAttribute("id", "btnInstallPolicy");
        btnInstallPolicy.innerText = "Install policy";
        policyForm.appendChild(btnInstallPolicy);        
        
        //Create cancel button
        let btnCancel = document.createElement("button");
        btnCancel.setAttribute("type", "button");
        btnCancel.setAttribute("class", "btn btn-secondary me-1");
        btnCancel.setAttribute("id", "btnCancel");
        btnCancel.innerText = "Cancel";
        policyForm.appendChild(btnCancel);

        policyForm.querySelector('form');
        policyForm.addEventListener('submit', handleAddPolicySubmit);
        btnInstallPolicy.addEventListener('click', () => {
            installPolicy(policyFormJson);
        });
        btnCancel.addEventListener('click', () => {
            buildPolicyTable();
        });

        var psVersionInput = document.getElementById('psVersion');
        var pVersionInput = document.getElementById('pVersion');
        psVersionInput.addEventListener('keydown', () => { restrictInputChars(event) });
        pVersionInput.addEventListener('keydown', () => { restrictInputChars(event) });
    };
}
