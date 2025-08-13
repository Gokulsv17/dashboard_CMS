import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify, Underline, List, Image, Type, Layout } from 'lucide-react';
import { apiService } from '../../services/api';

interface TemplateWidget {
  id: string;
  type: 'header' | 'content-with-sidebar' | 'detailed-content';
  name: string;
  preview: string;
  fields: WidgetField[];
}

interface WidgetField {
  id: string;
  type: 'text' | 'textarea' | 'image' | 'rich-text' | 'list';
  label: string;
  placeholder?: string;
  value: string;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    alignment?: 'left' | 'center' | 'right' | 'justify';
  };
  listItems?: string[];
}

interface SelectedTemplate {
  templateId: string;
  widgets: TemplateWidget[];
}

const AddBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [blogData, setBlogData] = useState({
    title: '',
    date: '',
    writtenBy: ''
  });
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Template system states
  const [selectedTemplate, setSelectedTemplate] = useState<SelectedTemplate | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);

  // Available templates
  const availableTemplates: TemplateWidget[] = [
    {
      id: 'header-template',
      type: 'header',
      name: 'Header Template',
      preview: 'Main Heading + Sub Heading + Banner Image',
      fields: [
        {
          id: 'main-heading',
          type: 'text',
          label: 'Main Heading',
          placeholder: 'Enter main heading...',
          value: '',
          formatting: { bold: true, alignment: 'left' }
        },
        {
          id: 'sub-heading',
          type: 'text',
          label: 'Sub Heading',
          placeholder: 'Enter sub heading...',
          value: '',
          formatting: { alignment: 'left' }
        },
        {
          id: 'banner-image',
          type: 'image',
          label: 'Banner Image',
          value: ''
        }
      ]
    },
    {
      id: 'content-sidebar-template',
      type: 'content-with-sidebar',
      name: 'Content with Sidebar Template',
      preview: 'Left Sidebar List + Right Content Section',
      fields: [
        {
          id: 'sidebar-list',
          type: 'list',
          label: 'Sidebar List Items',
          value: '',
          listItems: ['']
        },
        {
          id: 'content-section',
          type: 'rich-text',
          label: 'Content Section',
          placeholder: 'Enter your content here...',
          value: '',
          formatting: { alignment: 'left' }
        }
      ]
    },
    {
      id: 'detailed-content-template',
      type: 'detailed-content',
      name: 'Detailed Content Template',
      preview: 'Main Heading + Content + Multiple Subheading Groups + Image',
      fields: [
        {
          id: 'main-heading',
          type: 'text',
          label: 'Main Heading',
          placeholder: 'Enter main heading...',
          value: '',
          formatting: { bold: true, alignment: 'left' }
        },
        {
          id: 'main-content',
          type: 'rich-text',
          label: 'Main Content',
          placeholder: 'Enter your main content here...',
          value: '',
          formatting: { alignment: 'left' }
        },
        {
          id: 'subheading-groups',
          type: 'list',
          label: 'Subheading Groups',
          value: '',
          listItems: ['']
        },
        {
          id: 'subheading-contents',
          type: 'list',
          label: 'Subheading Contents',
          value: '',
          listItems: ['']
        },
        {
          id: 'content-image',
          type: 'image',
          label: 'Content Image',
          value: ''
        }
      ]
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBlogData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleTemplateSelect = (template: TemplateWidget) => {
    const newTemplate: SelectedTemplate = {
      templateId: template.id,
      widgets: [{ ...template, fields: template.fields.map(field => ({ ...field })) }]
    };
    setSelectedTemplate(newTemplate);
    setShowTemplateSelector(false);
    setActiveWidget(template.id);
  };

  const addTemplateWidget = (templateType: TemplateWidget) => {
    if (!selectedTemplate) return;
    
    const newWidget = {
      ...templateType,
      id: `${templateType.id}-${Date.now()}`,
      fields: templateType.fields.map(field => ({ ...field, value: '' }))
    };
    
    setSelectedTemplate({
      ...selectedTemplate,
      widgets: [...selectedTemplate.widgets, newWidget]
    });
    setActiveWidget(newWidget.id);
  };

  const updateWidgetField = (widgetId: string, fieldId: string, value: string) => {
    if (!selectedTemplate) return;
    
    setSelectedTemplate({
      ...selectedTemplate,
      widgets: selectedTemplate.widgets.map(widget =>
        widget.id === widgetId
          ? {
              ...widget,
              fields: widget.fields.map(field =>
                field.id === fieldId ? { ...field, value } : field
              )
            }
          : widget
      )
    });
  };

  const updateWidgetFieldFormatting = (widgetId: string, fieldId: string, formatting: any) => {
    if (!selectedTemplate) return;
    
    setSelectedTemplate({
      ...selectedTemplate,
      widgets: selectedTemplate.widgets.map(widget =>
        widget.id === widgetId
          ? {
              ...widget,
              fields: widget.fields.map(field =>
                field.id === fieldId 
                  ? { ...field, formatting: { ...field.formatting, ...formatting } }
                  : field
              )
            }
          : widget
      )
    });
  };

  const updateListItems = (widgetId: string, fieldId: string, items: string[]) => {
    if (!selectedTemplate) return;
    
    setSelectedTemplate({
      ...selectedTemplate,
      widgets: selectedTemplate.widgets.map(widget =>
        widget.id === widgetId
          ? {
              ...widget,
              fields: widget.fields.map(field =>
                field.id === fieldId ? { ...field, listItems: items } : field
              )
            }
          : widget
      )
    });
  };

  const RichTextToolbar = ({ widgetId, fieldId, formatting }: { widgetId: string, fieldId: string, formatting?: any }) => (
    <div className="flex items-center space-x-2 p-2 border-b border-gray-200 bg-gray-50">
      <button
        type="button"
        onClick={() => updateWidgetFieldFormatting(widgetId, fieldId, { bold: !formatting?.bold })}
        className={`p-2 rounded transition duration-200 ${
          formatting?.bold ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => updateWidgetFieldFormatting(widgetId, fieldId, { italic: !formatting?.italic })}
        className={`p-2 rounded transition duration-200 ${
          formatting?.italic ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => updateWidgetFieldFormatting(widgetId, fieldId, { underline: !formatting?.underline })}
        className={`p-2 rounded transition duration-200 ${
          formatting?.underline ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Underline className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-2"></div>
      <button
        type="button"
        onClick={() => updateWidgetFieldFormatting(widgetId, fieldId, { alignment: 'left' })}
        className={`p-2 rounded transition duration-200 ${
          formatting?.alignment === 'left' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => updateWidgetFieldFormatting(widgetId, fieldId, { alignment: 'center' })}
        className={`p-2 rounded transition duration-200 ${
          formatting?.alignment === 'center' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => updateWidgetFieldFormatting(widgetId, fieldId, { alignment: 'right' })}
        className={`p-2 rounded transition duration-200 ${
          formatting?.alignment === 'right' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => updateWidgetFieldFormatting(widgetId, fieldId, { alignment: 'justify' })}
        className={`p-2 rounded transition duration-200 ${
          formatting?.alignment === 'justify' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <AlignJustify className="w-4 h-4" />
      </button>
    </div>
  );

  const renderWidgetField = (widget: TemplateWidget, field: WidgetField) => {
    const fieldStyle = {
      fontWeight: field.formatting?.bold ? 'bold' : 'normal',
      fontStyle: field.formatting?.italic ? 'italic' : 'normal',
      textDecoration: field.formatting?.underline ? 'underline' : 'none',
      textAlign: field.formatting?.alignment || 'left'
    } as React.CSSProperties;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={field.value}
            onChange={(e) => updateWidgetField(widget.id, field.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder={field.placeholder}
            style={fieldStyle}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={field.value}
            onChange={(e) => updateWidgetField(widget.id, field.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 min-h-[120px] resize-none"
            placeholder={field.placeholder}
            style={fieldStyle}
          />
        );
      
      case 'rich-text':
        return (
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <RichTextToolbar widgetId={widget.id} fieldId={field.id} formatting={field.formatting} />
            <textarea
              value={field.value}
              onChange={(e) => updateWidgetField(widget.id, field.id, e.target.value)}
              className="w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none min-h-[200px] resize-none"
              placeholder={field.placeholder}
              style={fieldStyle}
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Upload image for this section</p>
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition duration-200">
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    updateWidgetField(widget.id, field.id, file.name);
                  }
                }}
                className="hidden"
              />
              Choose Image
            </label>
            {field.value && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {field.value}
              </div>
            )}
          </div>
        );
      
      case 'list':
        if (widget.type === 'detailed-content' && field.id === 'subheading-groups') {
          return (
            <div className="space-y-4">
              {field.listItems?.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newItems = [...(field.listItems || [])];
                        newItems[index] = e.target.value;
                        updateListItems(widget.id, field.id, newItems);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder={`Subheading ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = field.listItems?.filter((_, i) => i !== index) || [];
                        updateListItems(widget.id, field.id, newItems);
                        const contentField = widget.fields.find(f => f.id === 'subheading-contents');
                        if (contentField) {
                          const newContentItems = [...(contentField.listItems || [])];
                          newContentItems.splice(index, 1);
                          updateListItems(widget.id, 'subheading-contents', newContentItems);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <textarea
                    value={widget.fields.find(f => f.id === 'subheading-contents')?.listItems?.[index] || ''}
                    onChange={(e) => {
                      const contentField = widget.fields.find(f => f.id === 'subheading-contents');
                      if (contentField) {
                        const newItems = [...(contentField.listItems || [])];
                        newItems[index] = e.target.value;
                        updateListItems(widget.id, 'subheading-contents', newItems);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 min-h-[100px]"
                    placeholder={`Content for subheading ${index + 1}`}
                  />
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => {
                  const newItems = [...(field.listItems || []), ''];
                  updateListItems(widget.id, field.id, newItems);
                  const contentField = widget.fields.find(f => f.id === 'subheading-contents');
                  if (contentField) {
                    const newContentItems = [...(contentField.listItems || []), ''];
                    updateListItems(widget.id, 'subheading-contents', newContentItems);
                  }
                }}
                className="inline-flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
              >
                <List className="w-4 h-4 mr-2" />
                Add Subheading Group
              </button>
            </div>
          );
        }
        
        return (
          <div className="space-y-2">
            {field.listItems?.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...(field.listItems || [])];
                    newItems[index] = e.target.value;
                    updateListItems(widget.id, field.id, newItems);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder={`List item ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newItems = field.listItems?.filter((_, i) => i !== index) || [];
                    updateListItems(widget.id, field.id, newItems);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newItems = [...(field.listItems || []), ''];
                updateListItems(widget.id, field.id, newItems);
              }}
              className="inline-flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
            >
              <List className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!blogData.title || !blogData.date || !blogData.writtenBy || !summary || !description) {
      setError('Please fill in all required fields');
      return;
    }

    console.log('=== TEMPLATE DATA ===');
    console.log('Selected Template:', selectedTemplate);
    if (selectedTemplate) {
      selectedTemplate.widgets.forEach((widget, widgetIndex) => {
        console.log(`Widget ${widgetIndex + 1} (${widget.name}):`, {
          id: widget.id,
          type: widget.type,
          fields: widget.fields.map(field => ({
            id: field.id,
            type: field.type,
            label: field.label,
            value: field.value,
            formatting: field.formatting,
            listItems: field.listItems
          }))
        });
      });
    }

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(async () => {
      try {
        const blogApiData = {
          title: blogData.title,
          excerpt: summary,
          description: description,
          author: blogData.writtenBy,
          publishedAt: new Date(blogData.date).toISOString(),
          status: false,
          thumbnail: '',
          thumbnailFile: file || undefined,
          templateData: selectedTemplate
        };

        const response = await apiService.createBlog(blogApiData);
        
        if (response.success) {
          setIsSubmitting(false);
          setIsUploading(false);
          navigate('/blogs');
        } else {
          setError(response.error || 'Failed to create blog');
          setIsSubmitting(false);
          setIsUploading(false);
        }
      } catch (error) {
        setError('Failed to create blog');
        setIsSubmitting(false);
        setIsUploading(false);
      }
    }, 2000);
  };

  const cancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <div className="flex items-center">
        <Link
          to="/blogs"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Blogs
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Blog Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={blogData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter blog title"
                required
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={blogData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="writtenBy" className="block text-sm font-medium text-gray-700 mb-2">
                Written By
              </label>
              <input
                type="text"
                id="writtenBy"
                name="writtenBy"
                value={blogData.writtenBy}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Author name"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Features</h2>
            <p className="text-sm text-gray-600 mt-1">Summary Section</p>
          </div>
          <div className="p-6">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full h-32 border border-gray-300 rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Write your blog summary here..."
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
          </div>
          <div className="p-6">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-48 border border-gray-300 rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Write your detailed blog description here..."
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Blog Templates</h2>
            <p className="text-sm text-gray-600 mt-1">Select and customize templates for your blog content</p>
          </div>

          {!selectedTemplate && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition duration-200"
                >
                  <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.preview}</p>
                </div>
              ))}
            </div>
          )}

          {selectedTemplate && (
            <div className="space-y-6">
              {selectedTemplate.widgets.map((widget, widgetIndex) => (
                <div
                  key={widget.id}
                  className={`border rounded-lg p-6 transition-all duration-200 ${
                    activeWidget === widget.id ? 'border-blue-300 shadow-sm' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Type className="w-5 h-5 text-gray-400" />
                      <span className="text-lg font-medium text-gray-900">
                        {widget.name} #{widgetIndex + 1}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveWidget(activeWidget === widget.id ? null : widget.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {activeWidget === widget.id ? 'Collapse' : 'Edit'}
                    </button>
                  </div>

                  {activeWidget === widget.id && (
                    <div className="space-y-4">
                      {widget.fields.map((field) => (
                        <div key={field.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label}
                          </label>
                          {renderWidgetField(widget, field)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Add more sections:</span>
                {availableTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => addTemplateWidget(template)}
                    className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition duration-200"
                  >
                    <Layout className="w-4 h-4 mr-2" />
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Featured Image</h2>
          
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition duration-200"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">Choose a file or drag & drop it here</p>
              <p className="text-sm text-gray-500 mb-6">JPEG, PNG formats, up to 5MB</p>
              <label className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition duration-200">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                Browse File
              </label>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={isUploading || isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {isSubmitting || isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isUploading ? 'Uploading...' : 'Submitting...'}
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>

        {isUploading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{blogData.title || 'New Blog'}</h3>
                    <p className="text-sm text-gray-500">
                      {file ? formatFileSize(file.size) : '0 KB'} of {file ? formatFileSize(file.size) : '0 KB'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={cancelUpload}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddBlogPage;