// import React, { useState, useEffect } from 'react';
// import { X } from 'lucide-react';
// import { Commission, CommissionType } from '../types/commison';
// import toast from "react-hot-toast"
// interface CommissionModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   properties: Array<{ property_code: string; property_name: string }>;
//   onSave: (payload: CommissionPayload) => Promise<void>;
//   onFetchCommission: (propertyCode: string) => Promise<Commission | null>;
// }

// export interface CommissionPayload {
//   propertyCode: string;
//   type: CommissionType;
//   value: number;
//   isActive: boolean;
// }

// export const CommissionModal: React.FC<CommissionModalProps> = ({
//   isOpen,
//   onClose,
//   properties,
//   onSave,
//   onFetchCommission,
// }) => {
//   const [selectedProperty, setSelectedProperty] = useState<string>('');
//   const [commissionType, setCommissionType] = useState<CommissionType>('percentage');
//   const [commissionValue, setCommissionValue] = useState<string>('');
//   const [isActive, setIsActive] = useState<boolean>(true);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetchingCommission, setIsFetchingCommission] = useState(false);
//   const [existingCommission, setExistingCommission] = useState<Commission | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
  
//   // Individual field errors
//   const [errors, setErrors] = useState({
//     property: '',
//     value: '',
//     general: ''
//   });

//   // Fetch existing commission when property changes
//   useEffect(() => {
//     const fetchExistingCommission = async () => {
//       if (!selectedProperty) {
//         setExistingCommission(null);
//         setIsEditMode(false);
//         setCommissionValue('');
//         setCommissionType('percentage');
//         setIsActive(true);
//         return;
//       }

//       try {
//         setIsFetchingCommission(true);
//         const commission = await onFetchCommission(selectedProperty);
        
//         // Check if commission exists and has data
//         if (commission && commission._id) {
//           console.log('✅ Existing commission found:', commission);
//           setExistingCommission(commission);
//           setIsEditMode(true);
//           setCommissionValue(commission.value.toString());
//           setCommissionType(commission.type);
//           setIsActive(commission.isActive);
//         } else {
//           console.log('ℹ️ No commission found - CREATE mode');
//           setExistingCommission(null);
//           setIsEditMode(false);
//           setCommissionValue('');
//           setCommissionType('percentage');
//           setIsActive(true);
//         }
//       } catch (error) {
//         console.error('Failed to fetch commission:', error);
//         setExistingCommission(null);
//         setIsEditMode(false);
//         setCommissionValue('');
//         setCommissionType('percentage');
//         setIsActive(true);
//       } finally {
//         setIsFetchingCommission(false);
//       }
//     };

//     fetchExistingCommission();
//   }, [selectedProperty, onFetchCommission]);

//   // Reset form when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       setSelectedProperty('');
//       setCommissionValue('');
//       setCommissionType('percentage');
//       setIsActive(true);
//       setExistingCommission(null);
//       setIsEditMode(false);
//       setErrors({
//         property: '',
//         value: '',
//         general: ''
//       });
//     }
//   }, [isOpen]);

//   // Real-time validation for value field
//   useEffect(() => {
//     if (!commissionValue) {
//       setErrors(prev => ({ ...prev, value: '' }));
//       return;
//     }

//     const numValue = parseFloat(commissionValue);
//     if (isNaN(numValue)) {
//       setErrors(prev => ({ ...prev, value: 'Please enter a valid number' }));
//     } else if (numValue < 0) {
//       setErrors(prev => ({ ...prev, value: 'Value cannot be negative' }));
//     } else if (commissionType === 'percentage' && numValue > 100) {
//       setErrors(prev => ({ ...prev, value: 'Percentage cannot exceed 100' }));
//     } else {
//       setErrors(prev => ({ ...prev, value: '' }));
//     }
//   }, [commissionValue, commissionType]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Clear previous errors
//     const newErrors = {
//       property: '',
//       value: '',
//       general: ''
//     };

//     // Validation
//     if (!selectedProperty) {
//       newErrors.property = 'Please select a property';
//     }

//     if (!commissionValue) {
//       newErrors.value = 'Please enter a commission value';
//     } else {
//       const numValue = parseFloat(commissionValue);
//       if (isNaN(numValue)) {
//         newErrors.value = 'Please enter a valid number';
//       } else if (numValue < 0) {
//         newErrors.value = 'Value cannot be negative';
//       } else if (commissionType === 'percentage' && numValue > 100) {
//         newErrors.value = 'Percentage cannot exceed 100';
//       }
//     }

//     setErrors(newErrors);

//     // Check if there are any errors
//     if (Object.values(newErrors).some(error => error !== '')) {
//       return;
//     }

//     const payload: CommissionPayload = {
//       propertyCode: selectedProperty,
//       type: commissionType,
//       value: parseFloat(commissionValue),
//       isActive,
//     };

//     try {
//       setIsLoading(true);
//       await onSave(payload);
//       onClose();
//     } catch (err: any) {
//       setErrors(prev => ({ 
//         ...prev, 
//         general: err.message || `Failed to ${isEditMode ? 'update' : 'create'} commission` 
//       }));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b">
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800">
//               {isEditMode ? 'Update Commission' : 'Create Commission'}
//             </h2>
//             {isEditMode && (
//               <p className="text-xs text-gray-500 mt-0.5">
//                 Editing existing commission
//               </p>
//             )}
//           </div>
//           <button
//             onClick={onClose}
//             className="p-1 hover:bg-gray-100 rounded transition-colors"
//             disabled={isLoading}
//           >
//             <X className="w-5 h-5 text-gray-500" />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-4 space-y-4">

//           {/* Property Dropdown */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Property <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={selectedProperty}
//               onChange={(e) => {
//                 setSelectedProperty(e.target.value);
//                 setErrors(prev => ({ ...prev, property: '' }));
//               }}
//               className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm ${
//                 errors.property 
//                   ? 'border-red-300 focus:ring-red-500' 
//                   : 'border-gray-300 focus:ring-blue-500'
//               }`}
//               disabled={isLoading || isFetchingCommission}
//               required
//             >
//               <option value="">Select Property</option>
//               {properties.map((property) => (
//                 <option key={property.property_code} value={property.property_code}>
//                   {property.property_name}
//                 </option>
//               ))}
//             </select>
//             {errors.property && (
//               <p className="mt-1 text-xs text-red-600">{errors.property}</p>
//             )}
//             {isFetchingCommission && (
//               <p className="mt-1 text-xs text-blue-600 flex items-center gap-1">
//                 <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                     fill="none"
//                   />
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   />
//                 </svg>
//                 Checking for existing commission...
//               </p>
//             )}
//           </div>

//           {/* Commission Type Selection */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Commission Type <span className="text-red-500">*</span>
//             </label>
//             <div className="flex gap-3">
//               <button
//                 type="button"
//                 onClick={() => setCommissionType('percentage')}
//                 className={`flex-1 px-3 py-2 rounded border text-sm font-medium transition-colors ${
//                   commissionType === 'percentage'
//                     ? 'bg-blue-600 text-white border-blue-600'
//                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                 }`}
//                 disabled={isLoading || isFetchingCommission}
//               >
//                 Percentage (%)
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setCommissionType('fixed')}
//                 className={`flex-1 px-3 py-2 rounded border text-sm font-medium transition-colors ${
//                   commissionType === 'fixed'
//                     ? 'bg-blue-600 text-white border-blue-600'
//                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                 }`}
//                 disabled={isLoading || isFetchingCommission}
//               >
//                 Fixed Amount ($)
//               </button>
//             </div>
//           </div>

//           {/* Commission Value Input */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               {commissionType === 'percentage' ? 'Commission Percentage (%)' : 'Commission Amount ($)'} 
//               <span className="text-red-500"> *</span>
//             </label>
//             <input
//               type="number"
//               value={commissionValue}
//               onChange={(e) => setCommissionValue(e.target.value)}
//               placeholder={commissionType === 'percentage' ? '0 - 100' : 'Enter amount'}
//               min="0"
//               max={commissionType === 'percentage' ? '100' : undefined}
//               step={commissionType === 'percentage' ? '0.01' : '0.01'}
//               className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm ${
//                 errors.value 
//                   ? 'border-red-300 focus:ring-red-500' 
//                   : 'border-gray-300 focus:ring-blue-500'
//               }`}
//               disabled={isLoading || isFetchingCommission}
//               required
//             />
//             {errors.value ? (
//               <p className="mt-1 text-xs text-red-600">{errors.value}</p>
//             ) : (
//               <p className="mt-1 text-xs text-gray-500">
//                 {commissionType === 'percentage'
//                   ? 'Enter a percentage between 0 and 100'
//                   : 'Enter a fixed commission amount'}
//               </p>
//             )}
//           </div>

//           {/* Active Status Toggle */}
//           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//             <div>
//               <label className="text-sm font-medium text-gray-700">
//                 Active Status
//               </label>
//               <p className="text-xs text-gray-500 mt-0.5">
//                 Enable or disable this commission
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={() => setIsActive(!isActive)}
//               className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//                 isActive ? 'bg-blue-600' : 'bg-gray-300'
//               }`}
//               disabled={isLoading || isFetchingCommission}
//             >
//               <span
//                 className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                   isActive ? 'translate-x-6' : 'translate-x-1'
//                 }`}
//               />
//             </button>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-2 pt-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
//               disabled={isLoading}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//               disabled={isLoading || isFetchingCommission}
//             >
//               {isLoading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                       fill="none"
//                     />
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     />
//                   </svg>
//                   {isEditMode ? 'Updating...' : 'Creating...'}
//                 </span>
//               ) : (
//                 isEditMode ? 'Update Commission' : 'Create Commission'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };