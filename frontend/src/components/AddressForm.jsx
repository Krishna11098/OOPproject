// AddressForm.jsx - Suggested component
import React, { useState } from 'react';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format address for backend
    const formattedAddress = `${address.fullName}, ${address.phone}
${address.addressLine1}
${address.addressLine2 ? address.addressLine2 + '\n' : ''}${address.city}, ${address.state} - ${address.pincode}
${address.landmark ? 'Near: ' + address.landmark : ''}`.trim();
    
    onAddressSubmit(formattedAddress, address);
  };

  return (
    <form onSubmit={handleSubmit} className="address-form">
      <h3>📍 Shipping Address</h3>
      
      <div className="form-row">
        <input
          type="text"
          placeholder="Full Name"
          value={address.fullName}
          onChange={(e) => setAddress({...address, fullName: e.target.value})}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={address.phone}
          onChange={(e) => setAddress({...address, phone: e.target.value})}
          required
        />
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
        <input
          type="text"
          placeholder="Pincode"
          value={address.pincode}
          onChange={(e) => setAddress({...address, pincode: e.target.value})}
          required
        />
      </div>
      
      <input
        type="text"
        placeholder="Landmark (Optional)"
        value={address.landmark}
        onChange={(e) => setAddress({...address, landmark: e.target.value})}
      />
      
      <button type="submit">✅ Use This Address</button>
    </form>
  );
};

export default AddressForm;