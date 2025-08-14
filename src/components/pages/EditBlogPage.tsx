import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify, Underline, List, Image, Type, Layout, GripVertical, Plus, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { Blog } from '../../types';

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

interface DetailedContentSection {
  id: string;
  type: 'main-heading' | 'main-content' | 'subheading-groups' | 'content-image';
  label: string;
  order: number;
  data: any;
}

interface SubheadingGroup {
  id: string;
  subheading: string;
  content: string;
}

interface SelectedTemplate {
  templateId: string;
  widgets: TemplateWidget[];
}

const EditBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [blogData, setBlogData] = useState({
    title: '',
    date: '',
    writtenBy: ''
  });
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
   const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Template system states
  const [selectedTemplate, setSelectedTemplate] = useState<SelectedTemplate | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  
  // Detailed content template states
  const [detailedContentSections, setDetailedContentSections] = useState<DetailedContentSection[]>([]);
  const [subheadingGroups, setSubheadingGroups] = useState<SubheadingGroup[]>([]);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

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
      preview: 'Customizable sections with drag & drop ordering',
      fields: []
    }
  ];

  useEffect(() => {
    if (id) {
      loadBlog(id);
    }
  }, [id, navigate]);

  const loadBlog = async (blogId: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getBlogById(blogId);
      if (response.success && response.data) {
        const apiBlogs = response.data;
        const transformedBlog: Blog = {
          id: apiBlogs._id,
          title: apiBlogs.title,
          excerpt: apiBlogs.excerpt,
          description: apiBlogs.description,
          author: apiBlogs.author,
          authorAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          publishedAt: apiBlogs.publishedAt,
          status: apiBlogs.status ? 'published' : 'draft',
          thumbnail: apiBlogs.thumbnail,
          readTime: Math.ceil(apiBlogs.description.split(' ').length / 200),
          createdAt: apiBlogs.createdAt,
          updatedAt: apiBlogs.updatedAt
        };
        
        setBlog(transformedBlog);
        setBlogData({
          title: transformedBlog.title,
          date: transformedBlog.publishedAt.split('T')[0],
          writtenBy: transformedBlog.author
        });
        setSummary(transformedBlog.excerpt);
        setDescription(transformedBlog.description);

        // Load existing template data if available
        if (apiBlogs.templateData) {
          console.log('=== LOADING EXISTING TEMPLATE DATA ===');
          console.log('Template Data:', apiBlogs.templateData);
          setSelectedTemplate(apiBlogs.templateData);
          
          if (apiBlogs.detailedContentSections) {
            console.log('Detailed Content Sections:', apiBlogs.detailedContentSections);
            setDetailedContentSections(apiBlogs.detailedContentSections);
          }
          
          if (apiBlogs.subheadingGroups) {
            console.log('Subheading Groups:', apiBlogs.subheadingGroups);
            setSubheadingGroups(apiBlogs.subheadingGroups);
          }
        }
      } else {
        setError(response.error || 'Blog not found');
        navigate('/blogs');
      }
    } catch (error) {
      setError('Failed to load blog');
      navigate('/blogs');
    }
    setLoading(false);
  };

  // Initialize detailed content sections
  const initializeDetailedContentSections = () => {
    const defaultSections: DetailedContentSection[] = [
      {
        id: 'main-heading-section',
        type: 'main-heading',
        label: 'Main Heading',
        order: 0,
        data: { value: '', formatting: { bold: true, alignment: 'left' } }
      },
      {
        id: 'main-content-section',
        type: 'main-content',
        label: 'Main Content',
        order: 1,
        data: { value: '', formatting: { alignment: 'left' } }
      },
      {
        id: 'subheading-groups-section',
        type: 'subheading-groups',
        label: 'Subheading Groups',
        order: 2,
        data: []
      },
      {
        id: 'content-image-section',
        type: 'content-image',
        label: 'Content Image',
        order: 3,
        data: { value: '' }
      }
    ];
    setDetailedContentSections(defaultSections);
    setSubheadingGroups([{ id: '1', subheading: '', content: '' }]);
  };

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
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      // Clear any previous errors
      setError('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      // Validate file size (5MB limit)
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setFile(droppedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(droppedFile);
      
      // Clear any previous errors
      setError('');
    } else {
      setError('Please drop a valid image file (JPEG, PNG, WebP)');
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
    if (template.type === 'detailed-content') {
      initializeDetailedContentSections();
    }
    
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
    
    if (templateType.type === 'detailed-content') {
      initializeDetailedContentSections();
    }
    
    setSelectedTemplate({
      ...selectedTemplate,
      widgets: [...selectedTemplate.widgets, newWidget]
    });
    setActiveWidget(newWidget.id);
  };

  // Drag and drop handlers for sections
  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSectionDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    
    if (!draggedSection || draggedSection === targetSectionId) return;

    const draggedIndex = detailedContentSections.findIndex(s => s.id === draggedSection);
    const targetIndex = detailedContentSections.findIndex(s => s.id === targetSectionId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSections = [...detailedContentSections];
    const [draggedItem] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedItem);

    // Update order values
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));

    setDetailedContentSections(updatedSections);
    setDraggedSection(null);
  };

  // Section data handlers
  const updateSectionData = (sectionId: string, newData: any) => {
    setDetailedContentSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, data: newData }
          : section
      )
    );
  };

  // Subheading group handlers
  const addSubheadingGroup = () => {
    const newGroup: SubheadingGroup = {
      id: Date.now().toString(),
      subheading: '',
      content: ''
    };
    setSubheadingGroups(prev => [...prev, newGroup]);
  };

  const updateSubheadingGroup = (groupId: string, field: 'subheading' | 'content', value: string) => {
    setSubheadingGroups(prev =>
      prev.map(group =>
        group.id === groupId
          ? { ...group, [field]: value }
          : group
      )
    );
  };

  const removeSubheadingGroup = (groupId: string) => {
    setSubheadingGroups(prev => prev.filter(group => group.id !== groupId));
  };

  // Add section to detailed content template
  const addSectionToDetailedContent = (sectionType: 'main-heading' | 'main-content' | 'subheading-groups' | 'content-image') => {
    const newSection: DetailedContentSection = {
      id: `${sectionType}-${Date.now()}`,
      type: sectionType,
      label: getSectionLabel(sectionType),
      order: detailedContentSections.length,
      data: getDefaultSectionData(sectionType)
    };
    
    setDetailedContentSections(prev => [...prev, newSection]);
  };

  const getSectionLabel = (type: string) => {
    switch (type) {
      case 'main-heading': return 'Main Heading';
      case 'main-content': return 'Main Content';
      case 'subheading-groups': return 'Subheading Groups';
      case 'content-image': return 'Content Image';
      default: return 'Section';
    }
  };

  const getDefaultSectionData = (type: string) => {
    switch (type) {
      case 'main-heading':
        return { value: '', formatting: { bold: true, alignment: 'left' } };
      case 'main-content':
        return { value: '', formatting: { alignment: 'left' } };
      case 'subheading-groups':
        return [];
      case 'content-image':
        return { value: '' };
      default:
        return {};
    }
  };

  const removeSectionFromDetailedContent = (sectionId: string) => {
    setDetailedContentSections(prev => 
      prev.filter(section => section.id !== sectionId)
        .map((section, index) => ({ ...section, order: index }))
    );
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

  const renderDetailedContentSection = (section: DetailedContentSection) => {
    const fieldStyle = {
      fontWeight: section.data.formatting?.bold ? 'bold' : 'normal',
      fontStyle: section.data.formatting?.italic ? 'italic' : 'normal',
      textDecoration: section.data.formatting?.underline ? 'underline' : 'none',
      textAlign: section.data.formatting?.alignment || 'left'
    } as React.CSSProperties;

    switch (section.type) {
      case 'main-heading':
        return (
          <input
            type="text"
            value={section.data.value || ''}
            onChange={(e) => updateSectionData(section.id, { ...section.data, value: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Enter main heading..."
            style={fieldStyle}
          />
        );
      
      case 'main-content':
        return (
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <RichTextToolbar widgetId="detailed-content" fieldId={section.id} formatting={section.data.formatting} />
            <textarea
              value={section.data.value || ''}
              onChange={(e) => updateSectionData(section.id, { ...section.data, value: e.target.value })}
              className="w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none min-h-[200px] resize-none"
              placeholder="Enter your main content here..."
              style={fieldStyle}
            />
          </div>
        );
      
      case 'subheading-groups':
        return (
          <div className="space-y-4">
            {subheadingGroups.map((group, index) => (
              <div key={group.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={group.subheading}
                    onChange={(e) => updateSubheadingGroup(group.id, 'subheading', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder={`Subheading ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeSubheadingGroup(group.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <textarea
                  value={group.content}
                  onChange={(e) => updateSubheadingGroup(group.id, 'content', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 min-h-[100px]"
                  placeholder={`Content for subheading ${index + 1}`}
                />
              </div>
            ))}
            
            <button
              type="button"
              onClick={addSubheadingGroup}
              className="inline-flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subheading Group
            </button>
          </div>
        );
      
      case 'content-image':
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
                    updateSectionData(section.id, { ...section.data, value: file.name });
                  }
                }}
                className="hidden"
              />
              Choose Image
            </label>
            {section.data.value && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {section.data.value}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

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

    console.log('=== EDIT BLOG TEMPLATE DATA ===');
    console.log('Selected Template:', selectedTemplate);
    console.log('Detailed Content Sections:', detailedContentSections);
    console.log('Subheading Groups:', subheadingGroups);

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate upload completion
    setTimeout(async () => {
      try {
        if (id) {
          const updateData = {
            title: blogData.title,
            excerpt: summary,
            description: description,
            author: blogData.writtenBy,
            publishedAt: new Date(blogData.date).toISOString(),
            status: blog?.status === 'published' ? true : false,
            thumbnailFile: file || undefined,
            templateData: selectedTemplate,
            detailedContentSections: detailedContentSections,
            subheadingGroups: subheadingGroups
          };

          const response = await apiService.updateBlog(id, updateData);
          
          if (response.success) {
            setIsSubmitting(false);
            setIsUploading(false);
            navigate('/blogs');
          } else {
            setError(response.error || 'Failed to update blog');
            setIsSubmitting(false);
            setIsUploading(false);
          }
        }
      } catch (error) {
        setError('Failed to update blog');
        setIsSubmitting(false);
        setIsUploading(false);
      }
    }, 2000);
  };

  const cancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Blog not found</h2>
        <Link to="/blogs" className="text-blue-600 hover:text-blue-700">
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <Link
          to="/blogs"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Blogs
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Blog Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Features Section - Summary */}
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

        {/* Description Section */}
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

        {/* Blog Templates Section */}
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
                      {widget.type === 'detailed-content' ? (
                        <div className="space-y-6">
                          {/* Section Management Buttons */}
                          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 mr-2">Add Sections:</span>
                            <button
                              type="button"
                              onClick={() => addSectionToDetailedContent('main-heading')}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-lg transition duration-200"
                            >
                              <Type className="w-3 h-3 mr-1" />
                              Main Heading
                            </button>
                            <button
                              type="button"
                              onClick={() => addSectionToDetailedContent('main-content')}
                              className="inline-flex items-center px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition duration-200"
                            >
                              <Type className="w-3 h-3 mr-1" />
                              Main Content
                            </button>
                            <button
                              type="button"
                              onClick={() => addSectionToDetailedContent('subheading-groups')}
                              className="inline-flex items-center px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium rounded-lg transition duration-200"
                            >
                              <List className="w-3 h-3 mr-1" />
                              Subheading Groups
                            </button>
                            <button
                              type="button"
                              onClick={() => addSectionToDetailedContent('content-image')}
                              className="inline-flex items-center px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-medium rounded-lg transition duration-200"
                            >
                              <Image className="w-3 h-3 mr-1" />
                              Content Image
                            </button>
                          </div>

                          {/* Draggable Sections */}
                          <div className="space-y-4">
                            {detailedContentSections
                              .sort((a, b) => a.order - b.order)
                              .map((section) => (
                                <div
                                  key={section.id}
                                  draggable
                                  onDragStart={(e) => handleSectionDragStart(e, section.id)}
                                  onDragOver={handleSectionDragOver}
                                  onDrop={(e) => handleSectionDrop(e, section.id)}
                                  className={`border rounded-lg p-4 transition-all duration-200 cursor-move ${
                                    draggedSection === section.id 
                                      ? 'border-blue-400 bg-blue-50 shadow-lg' 
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <GripVertical className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm font-medium text-gray-700">
                                        {section.label}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeSectionFromDetailedContent(section.id)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded transition duration-200"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  
                                  <div>
                                    {renderDetailedContentSection(section)}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        // Regular template fields
                        widget.fields.map((field) => (
                          <div key={field.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                            </label>
                            {renderWidgetField(widget, field)}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Add more templates:</span>
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

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Update Image</h2>
          
          {/* Current Image */}
          {blog.thumbnail && !file && !imagePreview && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Current Image:</p>
              <img
                src={blog.thumbnail.startsWith('data:image/') || blog.thumbnail.startsWith('http') 
                  ? blog.thumbnail 
                  : 'https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop'}
                alt="Current blog thumbnail"
                className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop';
                }}
              />
            </div>
          )}
          
          {!file && !imagePreview ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition duration-200"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">Choose a new file or drag & drop it here</p>
              <p className="text-sm text-gray-500 mb-6">JPEG, PNG, WebP formats, up to 5MB</p>
              <label className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition duration-200">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                Browse File
              </label>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* File Info */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">{file?.name}</span>
                  <p className="text-xs text-gray-500">{file ? formatFileSize(file.size) : ''}</p>
                </div>
                {!imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setImagePreview(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
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
                  {isUploading ? 'Uploading...' : 'Updating...'}
                </>
              ) : (
                'Update Blog'
              )}
            </button>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{blogData.title || 'Updating Blog'}</h3>
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

export default EditBlogPage;