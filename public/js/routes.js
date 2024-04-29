
//Define domain URL and the policies URL
const policyTest = 'http://authzforce.apollo.internal:8080/authzforce-ce/domains/A0bdIbmGEeWhFwcKrC9gSQ/pap/policies/P1/1.1';
const appUrl = 'http://localhost:3000/azf/app';
const policiesUrl = 'https://wilma.apollo.internal:8443/authzforce-ce/domains/A0bdIbmGEeWhFwcKrC9gSQ/pap/policies';

var authToken;

//Fetch list of available policies
async function fetchPoliciesList() {
  //let authToken = await fetchToken();
  try {
      const response = await fetch(policiesUrl, {
        method: "get",
        headers: {
          "Authorization": "Bearer " + authToken,
        },
      });
      
      if (!response.ok) {
          throw new Error('Failed to fetch data');
      }
      
      const data = await response.text();
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(data,"text/xml");
      return data;
  } catch (error) {
      console.error('Error fetching data:', error);
      return null; // or you can throw error here
  }
}

//Fetch single policy
async function fetchPolicy(policyId, version = null) {
  ////let authToken = await fetchToken();
  if (version != null) {
    try {
      const response = await fetch(policiesUrl + "/" + policyId + "/" + version, {
        method: "get",
        headers: {
          "Authorization": "Bearer " + authToken,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.text();
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(data, "text/xml");
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null; // or you can throw error here
    }
  } else {
    try {
      fetchUrl = policiesUrl + "/" + policyId;
      const response = await fetch(fetchUrl, {
        method: "get",
        headers: {
          "Authorization": "Bearer " + authToken,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.text();
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(data, "text/xml");
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null; // or you can throw error here
    }
  }
}

//TEST Fetch single policy
async function fetchPolicyTEST() {
  try {
    const response = await fetch(policyTest);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.text();
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(data, "text/xml");
    console.log(xmlDoc);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

//Install new policy 
async function fetchPostPolicy(input, id = null) {
  //Check if policy id is specified and include the id in the URL to create a new version of the policy. This is used when we are modifying an existing policy. The policy ID and new version is returned.
  //Else send data to API address for all policies to create a new policy with version 1.0.
  if (id != null) {
    const response = await fetch(policiesUrl + "/" + id, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Authorization": "Bearer " + authToken,
      },
      body: input,
    });
    console.log("New version: " + response);
    return response;
  } else {
    const response = await fetch(policiesUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Authorization": "Bearer " + authToken,
      },
      body: input,
    });
    console.log("New policy: " + response);
    return response;
  }

}

//Delete policy. If only the id is specified, all version will be deleted. 
//When id and version are included only the specific version is deleted.
async function fetchDeletePolicy(id = null, version = null) {
  //let authToken = await fetchToken();
  if (id != null && version == null) {
    const response = await fetch(policiesUrl + "/" + id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Authorization": "Bearer " + authToken,
      },
    });
    return response;
  } else {
    const response = await fetch(policiesUrl + "/" + id  + "/" + version, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Authorization": "Bearer " + authToken,
      },
    });
  }
  return null;
}

//Fetch access token for authorization with Wilma PEP.
async function fetchToken() {
  const response = await fetch(appUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
  let data = await response.text();
  jsonData = JSON.parse(data);

  if (!document.getElementById("pText")) {
    let dataFieldDesc = document.getElementById("pDesc");
    let dataField = document.createElement("p");
    dataField.setAttribute("id", "pText");
    dataField.append(jsonData.access_token);
    dataFieldDesc.append(dataField);
  };

  console.log(jsonData.access_token);
  authToken = jsonData.access_token;
  
}

