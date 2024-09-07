import { dag4 } from '@stardust-collective/dag4';
import React, { useState, ChangeEvent, FormEvent } from "react";

// Define the type for the field structure
interface Field {
  fieldName: string;
  fieldValue: string;
}

const App: React.FC = () => {
  // Connect to default network endpoints
  dag4.account.connect({
    networkVersion: '2.0',
    testnet: true
  });

  // Initialize the fields state with proper typing
  const [fields, setFields] = useState<Field[]>([{ fieldName: "", fieldValue: "" }]);

  // Handle adding a new field
  const addField = () => {
    setFields([...fields, { fieldName: "", fieldValue: "" }]);
  };

  // Handle removing a field
  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  // Handle form input changes
  const handleFieldChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const newFields = [...fields];
    newFields[index][event.target.name as keyof Field] = event.target.value;
    setFields(newFields);
  };

  // Handle form submission
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Prepare the request
    const signatureRequest = fields.reduce((acc: Record<string, string>, field) => {
      acc[field.fieldName] = field.fieldValue;
      return acc;
    }, {});

    // Encode the signature request in Base64
    const signatureRequestEncoded = window.btoa(JSON.stringify(signatureRequest));

    // Call your signData method (using your blockchain provider)
    try {
      const provider = (window as any).ethereum; // TypeScript needs explicit casting for 'window.ethereum'
      const signature = await provider.request({
        method: "dag_signData",
        params: ["YOUR_DAG_ADDRESS_HERE", signatureRequestEncoded],
      });
      console.log("Signature:", signature);
    } catch (error) {
      console.error("Error signing data:", error);
    }
  };

  return (
    <div>
      <h1>Dynamic Fields Form</h1>
      <form onSubmit={handleSubmit}>
        {fields.map((field, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <input
              type="text"
              name="fieldName"
              placeholder="Field Name"
              value={field.fieldName}
              onChange={(event) => handleFieldChange(index, event)}
              style={{ marginRight: "10px" }}
            />
            <input
              type="text"
              name="fieldValue"
              placeholder="Field Value"
              value={field.fieldValue}
              onChange={(event) => handleFieldChange(index, event)}
              style={{ marginRight: "10px" }}
            />
            <button type="button" onClick={() => removeField(index)}>
              Remove Field
            </button>
          </div>
        ))}
        <button type="button" onClick={addField}>
          Add Field
        </button>
        <br />
        <button type="submit">Sign Data</button>
      </form>
    </div>
  );
};

export default App;
