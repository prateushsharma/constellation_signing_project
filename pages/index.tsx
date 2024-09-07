
'use client'

import React, { useState, ChangeEvent, FormEvent } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

interface Field {
  fieldName: string
  fieldValue: string
}

const predefinedFields = ["name", "age", "gender", "place"]

export default function DynamicFieldsForm() {
  const [fields, setFields] = useState<Field[]>([{ fieldName: "", fieldValue: "" }])
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; type: 'success' | 'error' } | null>(null)
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [formattedData, setFormattedData] = useState<any>(null) // Added state for formattedData

  const addField = () => {
    setFields([...fields, { fieldName: "", fieldValue: "" }])
  }

  const removeField = (index: number) => {
    const newFields = [...fields]
    newFields.splice(index, 1)
    setFields(newFields)
  }

  const handleFieldChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const newFields = [...fields]
    newFields[index][event.target.name as keyof Field] = event.target.value
    setFields(newFields)
  }

  const handleDropdownSelection = (index: number, value: string) => {
    const newFields = [...fields]
    newFields[index].fieldName = value
    setFields(newFields)
    setDropdownIndex(null)
  }

  const showToast = (title: string, description: string, type: 'success' | 'error') => {
    setToastMessage({ title, description, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  const connectWallet = async () => {
    try {
      setLoading(true)
      const provider = await (window as any).stargazer.getProvider("constellation")
      const accounts = await provider.request({ method: "dag_requestAccounts" })
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        showToast("Wallet Connected", `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`, "success")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      showToast("Error", "Failed to connect wallet", "error")
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
    setSignature(null)
    setFormattedData(null) // Clear formattedData on disconnect
    showToast("Wallet Disconnected", "You have disconnected from the wallet.", "success")
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!walletAddress) {
      connectWallet().then(() => {
        if (walletAddress) {
          signData()
        }
      })
    } else {
      signData()
    }
  }

  const signData = async () => {
    setLoading(true)
    try {
      const signatureRequest = fields.reduce((acc: Record<string, string>, field) => {
        acc[field.fieldName] = field.fieldValue
        return acc
      }, {})

      const signatureRequestEncoded = window.btoa(JSON.stringify(signatureRequest))
      const provider = (window as any).stargazer.getProvider("constellation")
      const signedData = await provider.request({
        method: "dag_signData",
        params: [walletAddress, signatureRequestEncoded],
      })
      setSignature(signedData)

      // Update formattedData state
      setFormattedData({
        value: signatureRequest,
        proofs: [
          {
            id: walletAddress || "",
            signature: signedData || ""
          }
        ]
      })

      showToast("Data Signed", "Your data has been successfully signed.", "success")
    } catch (error) {
      console.error("Error signing data:", error)
      showToast("Error", "Failed to sign data", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '40px auto',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Signing Form</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: '1' }}>
        {fields.map((field, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setDropdownIndex(index === dropdownIndex ? null : index)}
              style={{
                padding: '8px',
                fontSize: '14px',
                color: '#fff',
                backgroundColor: '#1890ff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              ↓
            </button>
            {dropdownIndex === index && (
              <div style={{
                position: 'absolute',
                backgroundColor: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
                padding: '10px',
                marginBottom: '10px',
              }}>
                {predefinedFields.map(option => (
                  <div
                    key={option}
                    onClick={() => handleDropdownSelection(index, option)}
                    style={{
                      padding: '8px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #d9d9d9',
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
            <input
              type="text"
              name="fieldName"
              placeholder="Field Name"
              value={field.fieldName}
              onChange={(event) => handleFieldChange(index, event)}
              style={inputStyle}
            />
            <input
              type="text"
              name="fieldValue"
              placeholder="Field Value"
              value={field.fieldValue}
              onChange={(event) => handleFieldChange(index, event)}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => removeField(index)}
              style={{
                ...buttonStyle,
                backgroundColor: '#ff4d4f',
                flex: '0 0 auto',
                width: '40px',
                fontSize: '18px'
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={addField} style={{...buttonStyle, backgroundColor: '#52c41a'}}>
          Add Field
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button
            type="button"
            onClick={connectWallet}
            disabled={!!walletAddress || loading}
            style={{...buttonStyle, backgroundColor: '#1890ff'}}
          >
            {loading ? "Connecting..." : walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
          </button>
          <button
            type="button"
            onClick={disconnectWallet}
            disabled={!walletAddress || loading}
            style={{...buttonStyle, backgroundColor: '#ff4d4f'}}
          >
            Disconnect
          </button>
          <button
            type="submit"
            disabled={!walletAddress || loading}
            style={{...buttonStyle, backgroundColor: '#722ed1'}}
          >
            {loading ? "Signing..." : "Sign Data"}
          </button>
        </div>
      </form>

      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: toastMessage.type === 'success' ? '#52c41a' : '#ff4d4f',
          color: '#fff',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
        }}>
          <h3 style={{ margin: '0 0 5px 0' }}>{toastMessage.title}</h3>
          <p style={{ margin: 0 }}>{toastMessage.description}</p>
        </div>
      )}

      {signature && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '4px', backgroundColor: '#f9f9f9', overflowX: 'auto' }}>
          <h2>Form Data</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{JSON.stringify(formattedData, null, 2)}</pre>
        </div>
      )}

      <footer style={{
        marginTop: 'auto',
        fontSize: '14px',
        color: '#333',
        textAlign: 'center',
      }}>
        <p style={{ margin: 0 }}>
          Built with ❤️
        </p>
        <p style={{ margin: 0 }}>
          <a href="https://github.com/prateushsharma" target="_blank" style={{ color: '#1890ff', textDecoration: 'none', marginRight: '8px' }}>Prateush</a>
          <a  target="_blank" style={{ color: '#1890ff', textDecoration: 'none', marginRight: '8px' }}>
            <FontAwesomeIcon icon={faDiscord} style={{ marginRight: '4px' }} /> @pikachu04
          </a>
        </p>
        <p style={{ margin: 0 }}>
          <a href="https://github.com/sen-Saptarshi" target="_blank" style={{ color: '#1890ff', textDecoration: 'none', marginRight: '8px' }}>Saptarshi</a>
          <a  target="_blank" style={{ color: '#1890ff', textDecoration: 'none' }}>
            <FontAwesomeIcon icon={faDiscord} style={{ marginRight: '4px' }} /> @erenyeager203
          </a>
        </p>
      </footer>
    </div>
  )
}

const inputStyle = {
  flex: 1,
  padding: '8px 12px',
  fontSize: '14px',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  outline: 'none',
}

const buttonStyle = {
  padding: '8px 16px',
  fontSize: '14px',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
}
