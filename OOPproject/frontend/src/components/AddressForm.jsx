// AddressForm.jsx - Suggested component
import React, { useState } from 'react';
import { FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import './AddressForm.css';

const AddressForm = ({ onAddressSubmit, initialAddress = {} }) => {
  const [address, setAddress] = useState({
    fullName: initialAddress.fullName || '',
    phone: initialAddress.phone || '',
    addressLine1: initialAddress.addressLine1 || '',
    addressLine2: initialAddress.addressLine2 || '',
    city: initialAddress.city || '',
    state: initialAddress.state || '',
    pincode: initialAddress.pincode || '',
    landmark: initialAddress.landmark || ''
  });

  const [pincodeError, setPincodeError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) {
      setPhoneError('Only numbers allowed');
      return;
    }
    
    // Check length
    if (value.length > 10) {
      return; // Don't allow more than 10 digits
    }
    
    setAddress({...address, phone: value});
    
    // Validate
    if (value.length > 0 && value.length < 10) {
      setPhoneError('Phone must be 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) {
      setPincodeError('Only numbers allowed');
      return;
    }
    
    // Check length
    if (value.length > 6) {
      return; // Don't allow more than 6 digits
    }
    
    setAddress({...address, pincode: value});
    
    // Validate
    if (value.length > 0 && value.length < 6) {
      setPincodeError('Pincode must be 6 digits');
    } else {
      setPincodeError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Final phone validation
    if (address.phone.length !== 10) {
      setPhoneError('Phone must be exactly 10 digits');
      return;
    }
    
    // Final pincode validation
    if (address.pincode.length !== 6) {
      setPincodeError('Pincode must be exactly 6 digits');
      return;
    }
    
    // Format address for backend
    const formattedAddress = `${address.fullName}, ${address.phone}
${address.addressLine1}
${address.addressLine2 ? address.addressLine2 + '\n' : ''}${address.city}, ${address.state} - ${address.pincode}
${address.landmark ? 'Near: ' + address.landmark : ''}`.trim();
    
    onAddressSubmit(formattedAddress, address);
  };

  return (
    <form onSubmit={handleSubmit} className="address-form">
      <h3><FaMapMarkerAlt /> Shipping Address</h3>
      
      <div className="form-row">
        <input
          type="text"
          placeholder="Full Name"
          value={address.fullName}
          onChange={(e) => setAddress({...address, fullName: e.target.value})}
          required
        />
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="tel"
            placeholder="Phone Number"
            value={address.phone}
            onChange={handlePhoneChange}
            maxLength="10"
            pattern="\d{10}"
            required
            style={{ borderColor: phoneError ? '#dc3545' : '' }}
          />
          {phoneError && (
            <span style={{ 
              color: '#dc3545', 
              fontSize: '12px', 
              position: 'absolute', 
              bottom: '-18px', 
              left: '0' 
            }}>
              {phoneError}
            </span>
          )}
        </div>
      </div>
      
      <input
        type="text"
        placeholder="Address Line 1"
        value={address.addressLine1}
        onChange={(e) => setAddress({...address, addressLine1: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="Address Line 2 (Optional)"
        value={address.addressLine2}
        onChange={(e) => setAddress({...address, addressLine2: e.target.value})}
      />
      
      <div className="form-row">
        <input
          type="text"
          placeholder="City"
          value={address.city}
          onChange={(e) => setAddress({...address, city: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="State"
          value={address.state}
          onChange={(e) => setAddress({...address, state: e.target.value})}
          required
        />
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Pincode"
            value={address.pincode}
            onChange={handlePincodeChange}
            maxLength="6"
            pattern="\d{6}"
            required
            style={{ borderColor: pincodeError ? '#dc3545' : '' }}
          />
          {pincodeError && (
            <span style={{ 
              color: '#dc3545', 
              fontSize: '12px', 
              position: 'absolute', 
              bottom: '-18px', 
              left: '0' 
            }}>
              {pincodeError}
            </span>
          )}
        </div>
      </div>
      
      <input
        type="text"
        placeholder="Landmark (Optional)"
        value={address.landmark}
        onChange={(e) => setAddress({...address, landmark: e.target.value})}
      />
      
      <button type="submit"><FaCheckCircle /> Use This Address</button>
    </form>
  );
};

export default AddressForm;