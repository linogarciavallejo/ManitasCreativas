import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Form, Input, Select, Space, Typography, Popconfirm, message, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { contactoService, Contacto, AlumnoContacto } from '../../services/contactoService';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Placeholder for NIT validation function - to be replaced with actual implementation later
const validateNIT = (_nit: string): boolean => {
  // This is a placeholder that always returns true
  // It will be replaced with actual validation logic later
  return true;
};

interface ContactosModalProps {
  visible: boolean;
  onClose: () => void;
  alumnoId: number | null;
  alumnoName: string;
}

const parentescoOptions = [
  { label: 'Madre', value: 'Madre' },
  { label: 'Padre', value: 'Padre' },
  { label: 'Abuelo/a', value: 'Abuelo/a' },
  { label: 'Tío/a', value: 'Tio/a' },
  { label: 'Hermano/a', value: 'Hermano/a' },
  { label: 'Tutor Legal', value: 'Tutor Legal' },
  { label: 'Otro', value: 'Otro' },
];

const ContactosModal: React.FC<ContactosModalProps> = ({ visible, onClose, alumnoId, alumnoName }) => {
  const [contactos, setContactos] = useState<AlumnoContacto[]>([]);
  const [allContactos, setAllContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(false);
  const [contactForm] = Form.useForm();
  const [relationshipForm] = Form.useForm();
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [relationshipModalVisible, setRelationshipModalVisible] = useState(false);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('1');

  // Fetch contacts for the student
  const fetchContactos = async () => {
    if (!alumnoId) return;
    
    try {
      setLoading(true);
      const data = await contactoService.getContactosByAlumnoId(alumnoId);
      // Ensure we always set an array, even if the API returns null/undefined or an object
      setContactos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      message.error('No se pudieron cargar los contactos');
      // Set to empty array on error
      setContactos([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all available contacts
  const fetchAllContactos = async () => {
    try {
      setLoading(true);
      const data = await contactoService.getAllContactos();
      // Ensure we always set an array, even if the API returns null/undefined or an object
      setAllContactos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching all contacts:', error);
      message.error('No se pudieron cargar todos los contactos');
      // Set to empty array on error
      setAllContactos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && alumnoId) {
      fetchContactos();
      fetchAllContactos();
    }
  }, [visible, alumnoId]);

  // Handle adding a new contact
  const handleAddContact = () => {
    setEditingContactId(null);
    contactForm.resetFields();
    setContactModalVisible(true);
  };

  // Handle editing an existing contact
  const handleEditContact = (contact: Contacto) => {
    setEditingContactId(contact.id);
    contactForm.setFieldsValue({
      nombre: contact.nombre,
      telefonoTrabajo: contact.telefonoTrabajo,
      celular: contact.celular,
      email: contact.email,
      direccion: contact.direccion,
      nit: contact.nit,
    });
    setContactModalVisible(true);
  };

  // Handle saving a contact (create or update)
  const handleSaveContact = async () => {
    try {
      const values = await contactForm.validateFields();
      setLoading(true);

      if (editingContactId === null) {
        // Create new contact
        const newContact = await contactoService.createContacto(values);
        message.success('Contacto creado con éxito');
        
        // If we're in the first tab, also associate the new contact with the student
        if (activeTab === '1' && alumnoId) {
          await handleAssociateContact(newContact.id, 'Otro');
        } else {
          // Just update the list of all contacts
          fetchAllContactos();
        }
      } else {
        // Update existing contact
        await contactoService.updateContacto(editingContactId, { ...values, id: editingContactId });
        message.success('Contacto actualizado con éxito');
        
        // Refresh both lists
        fetchContactos();
        fetchAllContactos();
      }

      setContactModalVisible(false);
    } catch (error) {
      console.error('Error saving contact:', error);
      message.error('Error al guardar el contacto');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a contact
  const handleDeleteContact = async (contactId: number) => {
    try {
      setLoading(true);
      await contactoService.deleteContacto(contactId);
      message.success('Contacto eliminado con éxito');
      
      // Refresh both lists
      fetchContactos();
      fetchAllContactos();
    } catch (error) {
      console.error('Error deleting contact:', error);
      message.error('Error al eliminar el contacto. Podría estar asociado a otros alumnos.');
    } finally {
      setLoading(false);
    }
  };

  // Handle removing association between student and contact
  const handleRemoveAssociation = async (contactId: number) => {
    if (!alumnoId) return;
    
    try {
      setLoading(true);
      await contactoService.removeAssociation(alumnoId, contactId);
      message.success('Contacto desvinculado con éxito');
      fetchContactos();
    } catch (error) {
      console.error('Error removing association:', error);
      message.error('Error al desvincular el contacto');
    } finally {
      setLoading(false);
    }
  };

  // Open the relationship modal
  const handleAddRelationship = () => {
    relationshipForm.resetFields();
    setRelationshipModalVisible(true);
  };

  // Handle associating an existing contact with the student
  const handleAssociateContact = async (contactId: number, parentesco: string) => {
    if (!alumnoId) return;
    
    try {
      setLoading(true);
      await contactoService.associateContacto(alumnoId, contactId, parentesco);
      message.success('Contacto asociado con éxito');
      fetchContactos();
      setRelationshipModalVisible(false);
    } catch (error) {
      console.error('Error associating contact:', error);
      message.error('Error al asociar el contacto');
    } finally {
      setLoading(false);
    }
  };

  // Handle updating the relationship type
  const handleUpdateRelationship = async (contactId: number, parentesco: string) => {
    if (!alumnoId) return;
    
    try {
      setLoading(true);
      await contactoService.updateAssociation(alumnoId, contactId, parentesco);
      message.success('Relación actualizada con éxito');
      fetchContactos();
    } catch (error) {
      console.error('Error updating relationship:', error);
      message.error('Error al actualizar la relación');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: ['contacto', 'nombre'],
      key: 'nombre',
      sorter: (a: AlumnoContacto, b: AlumnoContacto) => a.contacto.nombre.localeCompare(b.contacto.nombre),
    },
    {
      title: 'Parentesco',
      dataIndex: 'parentesco',
      key: 'parentesco',
      render: (parentesco: string, record: AlumnoContacto) => (
        <Select
          value={parentesco}
          style={{ width: 120 }}
          onChange={(value) => handleUpdateRelationship(record.contactoId, value)}
        >
          {parentescoOptions.map(option => (
            <Option key={option.value} value={option.value}>{option.label}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Teléfono Trabajo',
      dataIndex: ['contacto', 'telefonoTrabajo'],
      key: 'telefonoTrabajo',
    },
    {
      title: 'Celular',
      dataIndex: ['contacto', 'celular'],
      key: 'celular',
    },
    {
      title: 'Email',
      dataIndex: ['contacto', 'email'],
      key: 'email',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: AlumnoContacto) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditContact(record.contacto)}
          />
          <Popconfirm
            title="¿Está seguro de desvincular este contacto?"
            onConfirm={() => handleRemoveAssociation(record.contactoId)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const allContactsColumns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a: Contacto, b: Contacto) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: 'Teléfono Trabajo',
      dataIndex: 'telefonoTrabajo',
      key: 'telefonoTrabajo',
    },
    {
      title: 'Celular',
      dataIndex: 'celular',
      key: 'celular',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Contacto) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditContact(record)}
          />
          <Button
            type="default"
            icon={<LinkOutlined />}
            size="small"
            onClick={() => {
              relationshipForm.setFieldsValue({ contactoId: record.id, parentesco: 'Otro' });
              setRelationshipModalVisible(true);
            }}
          />
          <Popconfirm
            title="¿Está seguro de eliminar este contacto?"
            onConfirm={() => handleDeleteContact(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={<Title level={4}>Contactos para {alumnoName}</Title>}
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="back" onClick={onClose}>
          Cerrar
        </Button>,
      ]}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        tabBarExtraContent={
          activeTab === '1' ? (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddContact}
            >
              Nuevo Contacto
            </Button>
          ) : (
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddContact}
              >
                Nuevo Contacto
              </Button>
              <Button 
                type="default" 
                icon={<LinkOutlined />} 
                onClick={handleAddRelationship}
              >
                Vincular Contacto
              </Button>
            </Space>
          )
        }
      >
        <TabPane tab="Contactos Asociados" key="1">
          <Table
            columns={columns}
            dataSource={Array.isArray(contactos) ? contactos : []}
            rowKey={record => `${record.alumnoId}-${record.contactoId}`}
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
        <TabPane tab="Todos los Contactos" key="2">
          <Table
            columns={allContactsColumns}
            dataSource={Array.isArray(allContactos) ? allContactos : []}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
      </Tabs>

      {/* Modal for adding/editing contacts */}
      <Modal
        title={editingContactId === null ? 'Agregar Contacto' : 'Editar Contacto'}
        open={contactModalVisible}
        onCancel={() => setContactModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setContactModalVisible(false)}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleSaveContact}
          >
            Guardar
          </Button>,
        ]}
      >
        <Form
          form={contactForm}
          layout="vertical"
        >
          <Form.Item
            name="nombre"
            label="Nombre Completo"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input placeholder="Nombre completo del contacto" />
          </Form.Item>
          <Form.Item
            name="telefonoTrabajo"
            label="Teléfono Trabajo"
          >
            <Input placeholder="Teléfono de trabajo" />
          </Form.Item>
          <Form.Item
            name="celular"
            label="Celular"
            rules={[
              { required: true, message: 'Por favor ingrese el número de celular' },
              { 
                pattern: /^[0-9]{1,8}$/, 
                message: 'El celular debe contener solo números y máximo 8 dígitos' 
              }
            ]}
          >
            <Input 
              placeholder="Número de celular" 
              maxLength={8}
              onKeyPress={(e) => {
                // Allow only digit keys (0-9)
                const isDigit = /\d/.test(e.key);
                if (!isDigit) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { 
                type: 'email', 
                message: 'Por favor ingrese un email válido' 
              }
            ]}
          >
            <Input placeholder="Correo electrónico" />
          </Form.Item>
          <Form.Item
            name="direccion"
            label="Dirección"
            rules={[{ required: true, message: 'Por favor ingrese la dirección' }]}
          >
            <Input.TextArea placeholder="Dirección completa" rows={2} />
          </Form.Item>
          <Form.Item
            name="nit"
            label="NIT"
            rules={[
              {
                validator: async (_, value) => {
                  if (value && !validateNIT(value)) {
                    return Promise.reject('NIT inválido');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input placeholder="NIT para facturación" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for adding a relationship */}
      <Modal
        title="Vincular Contacto"
        open={relationshipModalVisible}
        onCancel={() => setRelationshipModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setRelationshipModalVisible(false)}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={async () => {
              try {
                const values = await relationshipForm.validateFields();
                handleAssociateContact(values.contactoId, values.parentesco);
              } catch (error) {
                console.error('Validation failed:', error);
              }
            }}
          >
            Vincular
          </Button>,
        ]}
      >
        <Form
          form={relationshipForm}
          layout="vertical"
        >
          <Form.Item
            name="contactoId"
            label="Contacto"
            rules={[{ required: true, message: 'Por favor seleccione un contacto' }]}
          >            <Select
              placeholder="Seleccione un contacto"
              showSearch
              filterOption={(input, option) =>
                option?.label ? option.label.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0 : false
              }
            >
              {Array.isArray(allContactos) ? allContactos.map(contacto => (
                <Option key={contacto.id} value={contacto.id}>{contacto.nombre}</Option>
              )) : null}
            </Select>
          </Form.Item>
          <Form.Item
            name="parentesco"
            label="Parentesco"
            rules={[{ required: true, message: 'Por favor seleccione el parentesco' }]}
            initialValue="Otro"
          >
            <Select placeholder="Seleccione el parentesco">
              {parentescoOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default ContactosModal;