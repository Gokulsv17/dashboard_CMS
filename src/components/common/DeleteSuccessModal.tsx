import React from 'react';
import { CheckCircle } from 'lucide-react';

interface DeleteSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'blog' | 'video';
}

const DeleteSuccessModal: React.FC<DeleteSuccessModalProps> = ({
  isOpen,
  onClose,
  type
}) => {
  if (!isOpen) return null;

  const itemType = type === 'blog' ? 'Blog' : 'Video';
  const backText = type === 'blog' ? 'Back to Blogs' : 'Back to Videos';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 mx-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {itemType} Deleted Successfully!
        </h3>
        
        <p className="text-gray-600 mb-8">
          Your {itemType.toLowerCase()} has been deleted
        </p>
        
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
        >
          {backText}
        </button>
      </div>
    </div>
  );
};

export default DeleteSuccessModal;