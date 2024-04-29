// Define the constants
//const policiesUrl = 'http://authzforce.apollo.internal:8080/authzforce-ce/domains/A0bdIbmGEeWhFwcKrC9gSQ/pap/policies/';
const policyP1Url = 'http://authzforce.apollo.internal:8080/authzforce-ce/domains/A0bdIbmGEeWhFwcKrC9gSQ/pap/policies/P1/1.1';
const testXml = '/xacmlTest.xml';
const testJson = '/js/saxon-js/testPolicy.json';
const xmlToJsonStylesheet = '/js/saxon-js/xacml-policy-xml-to-json.sef.json';
const jsonToXmlStylesheet = '/js/saxon-js/new_no_xacml-policy-json-to-xml.sef.json';
const airplanePolicySet = '/policySet.txt';
const addPolicyForm = '/html_form_create_policy.html';
const nsLink = 'ns2:link';
const nsResources = 'ns3:resources';

//Define the variables
var xacmlSource;
var policyList = [];

window.addEventListener("DOMContentLoaded", fetchToken, false);
setTimeout(function() {
  
  let policyView = document.getElementById("mainCard");
  console.log("I'm here too.");
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
        
  buildPolicyTable()
}, 500);

//Button "Get Policies"
window.addEventListener("DOMContentLoaded", (event) => {
  var buttonGetPolicies = document.getElementById("btnGetPolicies");
  buttonGetPolicies.addEventListener('click', buildPolicyTable, false);
});

//Button "Create Policy" 
window.addEventListener("DOMContentLoaded", (event) => {
  var buttonGetPolicies = document.getElementById("btnGetPolicy1");
  buttonGetPolicies.addEventListener('click', function () {
    //Clear the HTML view
    const div = document.getElementById("policyJsonTables");
    while (div.firstChild) {
      div.removeChild(div.firstChild);
    };
    createAddPolicyForm();
  }, false);
});

//Button "Test Button" 
window.addEventListener("DOMContentLoaded", (event) => {
  var buttonGetPolicies = document.getElementById("btnTest");
  buttonGetPolicies.addEventListener('click', buildPolicyTable, false);
});

//Transforms an XACML policy to JSON for further processing
function transformXmltoJson(input) {
  //Options for SaxonJS transformer
  var options = {
    stylesheetLocation: xmlToJsonStylesheet,
    sourceText: input,
    destination: "document"
  };
  console.log(input);
  //Transformation of XACML policy to JSON
  var result = SaxonJS.transform(options);
  var policyJson = SaxonJS.serialize(result.principalResult);
  console.log(result);
  //Remove XML prefix from JSON
  var prefix = '<?xml version="1.0" encoding="UTF-8"?>';
  if (policyJson.startsWith(prefix)) {
    // prefix is exactly at the beginning
    policyJson = policyJson.slice(prefix.length);
  }

  /*Print result to console and on website -- DEBUG ONLY
  console.log(policyJson);
  document.getElementById('output').innerHTML = JSON.stringify(JSON.parse(policyJson), undefined, 4);
  */

  //Prepare JSON object for processing and return it
  var xacmlJson = JSON.parse(policyJson);
  console.log(xacmlJson);
  return xacmlJson;
}

//Transform a JSON object to XML to upload it to the AuthzForce server
function transformJsonToXml(input) {
  //Convert JSON data to string
  input = JSON.stringify(input);
  SaxonJS.setLogLevel(10);
  //Options for SaxonJS transformer
  var options = {
    stylesheetLocation: jsonToXmlStylesheet,
    stylesheetParams: {
      jsonData: input,
    },
    sourceType: "json",
    //sourceText: input,
    destination: "raw"
  };
  console.log(input);

  //Transformation of JSON to XML
  let result = SaxonJS.transform(options);

  //Remove unwanted attributes and bring XML in valid form
  let policyXml = result.principalResult.attributes;
  console.log(policyXml);
  policyXml.removeNamedItem("xmlns:xs");
  policyXml = result.principalResult.childNodes[2].childNodes[2].childNodes[2].childNodes[0].childNodes[0].setAttribute("FunctionId", "urn:oasis:names:tc:xacml:1.0:function:string-equal");
  console.log(policyXml);
  policyXml = SaxonJS.serialize(result.principalResult);

  //Return the transformation result
  console.log(result);
  console.log(policyXml);

  //Parse string data to XML and return XML object
  //let parser = new DOMParser;
  //policyXml = parser.parseFromString(policyXml,"text/xml");
  return policyXml;
}

//Here we fetch an XML API response, parse it and then display the information about the available policies on the website.
async function getPoliciesList() {
  //Make API call and save response
  let input = await fetchPoliciesList();
  console.log(input);
  //Create XML parser and load response data
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(input,"text/xml");
  //Build HTML view
  console.log(xmlDoc);
  displayPolicyList(xmlDoc);
}

//Fetch XML API response, parse it, add the ID of the policy and build a website view
async function getPolicyVersions(id , version = null) {
  //Make API call and save response
  let input = await fetchPolicy(id);
  //Create XML parser and load response data
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(input,"text/xml");
  console.log(xmlDoc);
  //Add Policy ID to XML data
  let newElement = xmlDoc.createElement("policyId");
  newText = xmlDoc.createTextNode(id);
  newElement.appendChild(newText);
  xmlDoc.getElementsByTagName(nsResources)[0].appendChild(newElement);
  //Build HTML view
  displayPolicyVersions(xmlDoc);
}

//Fetch XML API response, parse it, transform it to JSON and then build website view
async function getPolicyElements(id, version = null) {
  const input = await fetchPolicy(id, version);
  inputJson = transformXmltoJson(input);
  console.log(inputJson);
  displayPolicyElement(inputJson);
}

//This function formats XML data for better readability.
var prettifyXml = function(sourceXml)
{
    var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
    var xsltDoc = new DOMParser().parseFromString([
        // describes how we want to modify the XML - indent everything
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
        '  <xsl:strip-space elements="*"/>',
        '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
        '    <xsl:value-of select="normalize-space(.)"/>',
        '  </xsl:template>',
        '  <xsl:template match="node()|@*">',
        '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
        '  </xsl:template>',
        '  <xsl:output indent="yes"/>',
        '</xsl:stylesheet>',
    ].join('\n'), 'application/xml');

    var xsltProcessor = new XSLTProcessor();    
    xsltProcessor.importStylesheet(xsltDoc);
    var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    var resultXml = new XMLSerializer().serializeToString(resultDoc);
    return resultXml;
};

//Take the information from getPoliciesList and display it on the website
function displayPolicyList(input) {
  if (!document.getElementById("policyList")) {
    //Get the list of available policies from the XML file
    let xmlData = input.getElementsByTagName(nsLink);
    console.log(input);
    console.log(xmlData);
    //---Build the policy list table
    //Get the div element and create a table for the Policy List
    const policyListDisplay = document.getElementById("policyJsonTables");
    
    //Clear the HTML view
    while (policyListDisplay.firstChild) {
      policyListDisplay.removeChild(policyListDisplay.firstChild);
    };

    const policyListTable = document.createElement("table");
    policyListTable.setAttribute("id", "policyList");
    //Create header and fill with data
    let policyListTableHead = policyListTable.createTHead();
    policyListTableHead.innerHTML = "List of installed policies: "
    //Create table
    policyListDisplay.appendChild(policyListTable);
    policyListTable.appendChild(policyListTableHead);

    //Take extracted elements from XML file, create a table row for each entry and populate the cells.
    for (let element of xmlData) {
      const pLElementId = policyListTable.insertRow(-1);
      let pLElementIdCell = pLElementId.insertCell(-1);
      let policy = element.attributes[1].nodeValue;
      pLElementIdCell.innerHTML = '<button id="' + policy + '">' + policy + '</button>';

      //Add eventlistener for button to load policy versions
      document.getElementById(policy).addEventListener('click', () => getPolicyVersions(id = policy));
    };
    
  };
}

//Take the information from getPoliciesList and display it on the website
function displayPolicyVersions(input) {
  if (!document.getElementById("policyVersionList")) {
    //Get the policy id and a list of available policy versions from the XML file
    let xmlPolicyId = input.getElementsByTagName("policyId")[0].textContent;
    let xmlData = input.getElementsByTagName(nsLink);

    //---Build the policy version list table
    //Get the div element and create a table for the Policy Version List
    const policyListDisplay = document.getElementById("policyJsonTables");
    
    //Clear the HTML view
    while (policyListDisplay.firstChild) {
      policyListDisplay.removeChild(policyListDisplay.firstChild);
    };

    const policyListTable = document.createElement("table");
    policyListTable.setAttribute("id", "policyVersionList");
    //Create header and fill with data
    let policyListTableHead = policyListTable.createTHead();
    policyListTableHead.innerHTML = "Policy " + xmlPolicyId + " version history: "
    //Create table
    policyListDisplay.appendChild(policyListTable);
    policyListTable.appendChild(policyListTableHead);

    //Take extracted elements from XML file, create a table row for each entry and populate the cells.
    for (var element of xmlData) {
      const pLElementId = policyListTable.insertRow(-1);
      let pLElementIdCell = pLElementId.insertCell(-1);
      let xmlPolicyVersion = element.attributes[1].nodeValue;
      pLElementIdCell.innerHTML = '<button id="' + xmlPolicyVersion + '">' + xmlPolicyVersion + '</button>';
      //Add eventlistener for button to load policy versions
      document.getElementById(xmlPolicyVersion).addEventListener('click', () => getPolicyElements(id = xmlPolicyId, version = xmlPolicyVersion));
    };
  };
}

//This function grabs the information about a policy object in a PolicySet and displays that in an HTML table.
function displayPolicyElement(_policyJson) {
  
  if (!document.getElementById("policy1")) {
    let id = _policyJson.Policy.Id;
    let version = _policyJson.Policy.Version;
    let desc = _policyJson.Policy.Desc;
    let combiner = _policyJson.Policy.CombinerId.slice(56); //slice 56 characters to remove urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:

    //Get the div element and create a table for the PolicySet
    let policyDisplay = document.getElementById("mainCard");
    
    while (policyDisplay.firstChild) {
      policyDisplay.removeChild(policyDisplay.firstChild);
    }

    let policyTable = document.createElement("table");
    policyTable.setAttribute("id", "policySet");
    policyDisplay.appendChild(policyTable);

    //Add the table header
    const tableHead = document.createElement("th");
    tableHead.setAttribute("id", "policyset1")
    tableHead.innerText = "PolicySet: ";

    //Now follows the table data
    //PolicySet Id
    const idElement = document.createElement("tr");
    var x = idElement.insertCell(0);
    x.innerHTML = "ID: ";
    x = idElement.insertCell(-1);
    x.setAttribute("id", "psId");
    x.innerHTML = _policyJson.Policy.Id;

    //PolicySet version
    const versionElement = document.createElement("tr");
    var x = versionElement.insertCell(0);
    x.innerHTML = "Version: ";
    x = versionElement.insertCell(-1);
    x.setAttribute("id", "psVersion");
    x.innerHTML = _policyJson.Policy.Version;

    //PolicySet description
    const descElement = document.createElement("tr");
    var x = descElement.insertCell(0);
    x.innerHTML = "Description: ";
    x = descElement.insertCell(-1);
    x.innerHTML = _policyJson.Policy.Desc;

    //PolicySet combiner id
    const combIdElement = document.createElement("tr");
    var x = combIdElement.insertCell(0);
    x.innerHTML = "Combiner: ";
    x = combIdElement.insertCell(-1);
    x.innerHTML = combiner;

    //Append the data to the table element
    policyTable.appendChild(tableHead);
    policyTable.appendChild(idElement);
    policyTable.appendChild(versionElement);
    policyTable.appendChild(descElement);
    policyTable.appendChild(combIdElement);
  

    //Get the JSON data
    //var policy1Json = _policyJson.Policy.CombinerArgs[0].Policy;
    var policy1Target = _policyJson.Policy.CombinerArgs[0].Policy.Target[0][0][0];
    var policy1Rules = _policyJson.Policy.CombinerArgs[0].Policy.CombinerArgs[0];
    var policy1RuleTarget = _policyJson.Policy.CombinerArgs[0].Policy.CombinerArgs[0].Rule.Target;

    let policyId = _policyJson.Policy.CombinerArgs[0].Policy.Id;
    let policyVersion = _policyJson.Policy.CombinerArgs[0].Policy.Version;
    let policyDesc = _policyJson.Policy.CombinerArgs[0].Policy.Desc;
    let policyCombinerId = _policyJson.Policy.CombinerArgs[0].Policy.CombinerId.slice(54); //slice 54 characters to remove urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:

    //Add the table header and append it to the policy table
    const policyTableHead = document.createElement("th");
    policyTableHead.innerText = "Policy: ";
    policyTable.appendChild(policyTableHead);

    //Create table rows and cells and fill them with data
    //Policy Id
    const policyIdElement = policyTable.insertRow(-1);
    var x = policyIdElement.insertCell(0);
    x.innerHTML = "ID: ";
    x = policyIdElement.insertCell(-1);
    x.innerHTML = policyId;

    //Policy version
    const policyVersionElement = policyTable.insertRow(-1);
    var x = policyVersionElement.insertCell(0);
    x.innerHTML = "Version: ";
    x = policyVersionElement.insertCell(-1);
    x.innerHTML = policyVersion;

    //Policy description
    const policyDescElement = policyTable.insertRow(-1);
    var x = policyDescElement.insertCell(0);
    x.innerHTML = "Description: ";
    x = policyDescElement.insertCell(-1);
    x.innerHTML = policyDesc;

    //Policy combiner id
    const policyCombIdElement = policyTable.insertRow(-1);
    var x = policyCombIdElement.insertCell(0);
    x.innerHTML = "Combiner: ";
    x = policyCombIdElement.insertCell(-1);
    x.innerHTML = policyCombinerId;

    //Empty row
    const emptyElement = policyTable.insertRow(-1);
    var x = emptyElement.insertCell(0);
    x.innerHTML = "--------------------------------";

    //Policy target and rules
    //Create target attribute designator and name
    const policyTargetElement = policyTable.insertRow(-1);
    var x = policyTargetElement.insertCell(0);
    x.innerHTML = "Target: ";
    x = policyTargetElement.insertCell(-1);
    x.innerHTML = policy1Target.AttributeDesignator.AttributeId.slice(38);
    x = policyTargetElement.insertCell(-1);
    x.innerHTML = policy1Target.MatchedValue;

    //Rule heading
    const policyRuleHeadingElement = policyTable.insertRow(-1);
    var x = policyRuleHeadingElement.insertCell(0);
    x.innerHTML = "Rule: ";

    //Rule description, Id, and Effect
    const policyRuleDescElement = policyTable.insertRow(-1);
    x = policyRuleDescElement.insertCell(0);
    x.innerHTML = "Description: ";
    x = policyRuleDescElement.insertCell(-1);
    x.innerHTML = policy1Rules.Rule.Desc;

    const policyRuleIdElement = policyTable.insertRow(-1);
    x = policyRuleIdElement.insertCell(0);
    x.innerHTML = "ID: ";
    x = policyRuleIdElement.insertCell(-1);
    x.innerHTML = policy1Rules.Rule.Id;

    const policyRuleEffectElement = policyTable.insertRow(-1);
    x = policyRuleEffectElement.insertCell(0);
    x.innerHTML = "Effect: ";
    x = policyRuleEffectElement.insertCell(-1);
    x.innerHTML = policy1Rules.Rule.Effect;

    //Create the table view
    const p1rtElement = policyTable.insertRow(-1);
    var x = p1rtElement.insertCell(0);
    x.innerHTML = "Target: ";

    //Create the rule target elements
    policy1RuleTarget.forEach(element => {
      //Get the sub-array
      var p1rtArray = element[0][0];

      var y = p1rtElement.insertCell(-1);
      y.innerHTML = p1rtArray.AttributeDesignator.Category.slice(48) + ":";
      y = p1rtElement.insertCell(-1);
      y.innerHTML = p1rtArray.MatchedValue;
    });

    //Get the condition elements and create a table view
    //Get elements and save them to constants to save space
    const p1rrcfFuncId = policy1Rules.Rule.Condition.FuncCall.FuncId;
    const p1rrcfa1ConstValue = policy1Rules.Rule.Condition.FuncCall.ArgExprs[1].Const.Value;
    const p1rrcfa2aCategory = policy1Rules.Rule.Condition.FuncCall.ArgExprs[2].AttributeDesignator.Category;
    const p1rrcfa2aAttributeId = policy1Rules.Rule.Condition.FuncCall.ArgExprs[2].AttributeDesignator.AttributeId;

    //Create condition table view
    //Create heading
    const p1rrcTblHeader = policyTable.insertRow(-1);
    var p1rrcaTblCell = p1rrcTblHeader.insertCell(0);
    p1rrcaTblCell.innerHTML = "Condition: ";

    //Create data
    //Function Id
    const p1rrcTblFuncIdElement = policyTable.insertRow(-1);
    p1rrcaTblCell = p1rrcTblFuncIdElement.insertCell(0);
    p1rrcaTblCell.innerHTML = "Function: ";
    p1rrcaTblCell = p1rrcTblFuncIdElement.insertCell(-1);
    p1rrcaTblCell.innerHTML = p1rrcfFuncId.slice(38);

    //Role name - const value
    const p1rrcTblConstValueElement = policyTable.insertRow(-1);
    p1rrcaTblCell = p1rrcTblConstValueElement.insertCell(0);
    p1rrcaTblCell.innerHTML = "Role name: ";
    p1rrcaTblCell = p1rrcTblConstValueElement.insertCell(-1);
    p1rrcaTblCell.innerHTML = p1rrcfa1ConstValue;

    //Attribute category
    const p1rrcTblCategoryElement = policyTable.insertRow(-1);
    p1rrcaTblCell = p1rrcTblCategoryElement.insertCell(0);
    p1rrcaTblCell.innerHTML = "Category: ";
    p1rrcaTblCell = p1rrcTblCategoryElement.insertCell(-1);
    p1rrcaTblCell.innerHTML = p1rrcfa2aCategory.slice(46);

    //Attribute category
    const p1rrcTblAttributeIdElement = policyTable.insertRow(-1);
    p1rrcaTblCell = p1rrcTblAttributeIdElement.insertCell(0);
    p1rrcaTblCell.innerHTML = "Attribute ID: ";
    p1rrcaTblCell = p1rrcTblAttributeIdElement.insertCell(-1);
    p1rrcaTblCell.innerHTML = p1rrcfa2aAttributeId.slice(37); 

    //Create Modify button
    const policyTableBtn = policyTable.insertRow(-1);
    policyTableBtnModifyCell = policyTableBtn.insertCell(0);
    btnPolicyModify = document.createElement("button");
    btnPolicyModify.setAttribute("type", "button");
    btnPolicyModify.setAttribute("class", "btn btn-primary");
    btnPolicyModify.setAttribute("id", "btnPolicyModify");
    btnPolicyModify.innerText = "Modify policy";
    policyTableBtnModifyCell.appendChild(btnPolicyModify);
    //policyTable.appendChild(btnPolicyModify);

    btnPolicyModify.addEventListener('click', modifyPolicy);

    //Create Delete button
    policyTableBtnDeleteCell = policyTableBtn.insertCell(-1);
    btnPolicyDelete = document.createElement("button");
    btnPolicyDelete.setAttribute("type", "button");
    btnPolicyDelete.setAttribute("class", "btn btn-primary");
    btnPolicyDelete.setAttribute("id", "btnPolicyDelete");
    btnPolicyDelete.innerText = "Delete policy";
    policyTableBtnDeleteCell.appendChild(btnPolicyDelete);
    //policyTable.appendChild(btnPolicyDelete);

    btnPolicyDelete.addEventListener('click', displayDeletePolicy);


  };
}

//With this function we create a new policy form with the data from the currently viewed policy set.
async function modifyPolicy() {
  //Get current policy ID and Version to pass on to fetch function.
  let policyId = document.getElementById("psId").innerText;
  let policyVersion = document.getElementById("psVersion").innerText;
  console.log(policyId);
  console.log(policyVersion);
  //Fetch data of currently viewed policy set and transform response to JSON
  const input = await fetchPolicy(policyId, policyVersion);
  let inputJson = transformXmltoJson(input);
  console.log(inputJson);
  //Create a policy input form and prefill the inputs with policy data from fetch.
  createModifyPolicyForm(inputJson);
}

//--TODO: Remake into a modal.
async function displayDeletePolicy() {
  //--Get current policy ID and Version for processing.
  let policyId = document.getElementById("psId").innerText;
  let policyVersion = document.getElementById("psVersion").innerText;
  console.log(policyId);
  console.log(policyVersion);

  //--Create new view.
  let deletePolicyView = document.getElementById("mainCard");
  let deletePolicyHeader = document.createElement("h5");
  deletePolicyHeader.setAttribute("class", "card-title");
  deletePolicyHeader.innerText = "Delete Policy";

  //Clear div to prepare and add deletePolicyView
  while (deletePolicyView.firstChild) {
    deletePolicyView.removeChild(deletePolicyView.firstChild);
  };
  deletePolicyView.appendChild(deletePolicyHeader);

  //Add description and buttons for options "delete current policy version" and "delete current policy including all versions".
  let deletePolicyParagraph = document.createElement("p");
  deletePolicyParagraph.setAttribute("id", "deletePolicyText");
  deletePolicyParagraph.innerText = 'Delete only current policy version or delete the whole policy including all versions? Click "cancel" to return.';
  deletePolicyView.appendChild(deletePolicyParagraph);

  //Add buttons to choose options.
  btnDeleteCurrentVersion = document.createElement("button");
  btnDeleteCurrentVersion.setAttribute("type", "button");
  btnDeleteCurrentVersion.setAttribute("class", "btn btn-warning me-1");
  btnDeleteCurrentVersion.setAttribute("id", "btnDeleteCurrentVersion");
  btnDeleteCurrentVersion.innerText = "Delete current Version";

  btnDeleteAllVersions = document.createElement("button");
  btnDeleteAllVersions.setAttribute("type", "button");
  btnDeleteAllVersions.setAttribute("class", "btn btn-danger me-1");
  btnDeleteAllVersions.setAttribute("id", "btnDeleteAllVersions");
  btnDeleteAllVersions.innerText = "Delete all Versions";

  btnCancel = document.createElement("button");
  btnCancel.setAttribute("type", "button");
  btnCancel.setAttribute("class", "btn btn-primary me-1");
  btnCancel.setAttribute("id", "btnCancel");
  btnCancel.innerText = "Cancel";

  deletePolicyView.appendChild(btnDeleteCurrentVersion);
  deletePolicyView.appendChild(btnDeleteAllVersions);
  deletePolicyView.appendChild(btnCancel);

  //Add functionality to buttons.
  btnDeleteCurrentVersion.addEventListener('click', () => {fetchDeletePolicy(policyId, policyVersion)});
  btnDeleteAllVersions.addEventListener('click', () => {fetchDeletePolicy(policyId)});
  btnCancel.addEventListener('click', () => {getPolicyElements(policyId, policyVersion)});
}
