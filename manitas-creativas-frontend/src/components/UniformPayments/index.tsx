import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  Card,
  AutoComplete,
  Typography,
  Table,
  Space,
  Checkbox,
  Modal,
  Image,
  Popconfirm,
  Tag
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { makeApiRequest } from '../../services/apiHelper';
import { getCurrentUserId } from '../../services/authService';
import { rubroUniformeDetalleService, RubroUniformeDetalle } from '../../services/rubroUniformeDetalleService';
import { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;

interface Alumno {
  id: number;
  codigo: string;
  fullName: string;
}

interface AlumnoOption {
  value: string;
  label: string;
  codigo: string;
}

interface Rubro {
  id: number;
  descripcion: string;
  tipo: string;
  montoPreestablecido?: number;
  esColegiatura: boolean;
  esPagoDeUniforme?: boolean;
  nivelEducativoId?: number;
}

interface AlumnoDetails {
  id: number;
  codigo: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  sedeId: number;
  sedeNombre: string;
  gradoId: number;
  gradoNombre: string;
  nivelEducativoId: number;
  seccion: string | null;
  becado: boolean | null;
  becaParcialPorcentaje: number | null;
  observaciones?: string;
  pagos: Array<{
    id: number;
    fecha: string;
    monto: number;
    rubroDescripcion: string;
  }>;
}

interface UniformItem {
  key: string;
  rubroUniformeDetalleId: number;
  prendaUniformeId: number;
  descripcion: string;
  sexo: string;
  talla: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  imageUrl?: string;
}

interface PagoDetalleCreateDto {
  rubroUniformeDetalleId: number;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

const UniformPayments: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingRubro, setLoadingRubro] = useState<boolean>(false);
  const [alumnoId, setAlumnoId] = useState<string | null>(null);
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);
  const [typeaheadOptions, setTypeaheadOptions] = useState<AlumnoOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<AlumnoDetails | null>(null);
  const [autoCompleteValue, setAutoCompleteValue] = useState<string>("");
  
  // Uniform-specific states
  const [uniformRubros, setUniformRubros] = useState<Rubro[]>([]);
  const [selectedRubro, setSelectedRubro] = useState<Rubro | null>(null);
  const [dinamicRubroId, setDinamicRubroId] = useState<string>("");
  const [payFullUniform, setPayFullUniform] = useState<boolean>(true);
  const [uniformItems, setUniformItems] = useState<UniformItem[]>([]);
  const [availableUniformItems, setAvailableUniformItems] = useState<RubroUniformeDetalle[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  
  // Modal states
  const [itemModalVisible, setItemModalVisible] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<UniformItem | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Fetch uniform rubros based on selected student's nivel educativo
  useEffect(() => {
    const fetchUniformRubros = async () => {
      if (!selectedStudentDetails) {
        setUniformRubros([]);
        return;
      }

      try {
        setLoadingRubro(true);
        const response = await makeApiRequest<Rubro[]>('/rubros', 'GET');
        
        // Debug logging
        //console.log('All rubros from API:', response);
        //console.log('Selected student nivel educativo:', selectedStudentDetails.nivelEducativoId);
        
        const uniformRubros = response.filter(rubro => {
          const isUniformPayment = rubro.esPagoDeUniforme === true;
          const isCorrectLevel = rubro.nivelEducativoId === selectedStudentDetails.nivelEducativoId || rubro.nivelEducativoId === 999;
          
          console.log(`Rubro ${rubro.id} - ${rubro.descripcion}:`, {
            esPagoDeUniforme: rubro.esPagoDeUniforme,
            nivelEducativoId: rubro.nivelEducativoId,
            isUniformPayment,
            isCorrectLevel,
            passes: isUniformPayment && isCorrectLevel
          });
          
          return isUniformPayment && isCorrectLevel;
        });
        
        console.log('Filtered uniform rubros:', uniformRubros);
        setUniformRubros(uniformRubros);

        // Auto-select if only one uniform is available
        if (uniformRubros.length === 1) {
          const singleRubro = uniformRubros[0];
          setSelectedRubro(singleRubro);
          setDinamicRubroId(singleRubro.id.toString());
          
          // Update form with the selected rubro
          form.setFieldsValue({ 
            rubroId: singleRubro.id.toString(),
            monto: singleRubro.montoPreestablecido || 0
          });

          // Fetch available uniform items for this auto-selected rubro
          try {
            const uniformDetails = await rubroUniformeDetalleService.getRubroUniformeDetallesByRubroId(singleRubro.id);
            setAvailableUniformItems(uniformDetails);
            
            if (payFullUniform) {
              // Calculate total amount for full uniform
              const total = uniformDetails.reduce((sum, item) => sum + item.prendaUniformePrecio, 0);
              setTotalAmount(total);
              form.setFieldsValue({ monto: total });
            }
          } catch (error) {
            console.error('Error fetching uniform details for auto-selected rubro:', error);
            toast.error('Error al cargar los detalles del uniforme');
          }
        }
      } catch (error) {
        console.error('Error fetching uniform rubros:', error);
        toast.error('Error al cargar los rubros de uniformes');
      } finally {
        setLoadingRubro(false);
      }
    };

    fetchUniformRubros();
  }, [selectedStudentDetails, payFullUniform, form]);

  // Handle rubro selection
  const handleRubroChange = async (rubroId: string) => {
    const selected = uniformRubros.find(rubro => rubro.id.toString() === rubroId);
    setSelectedRubro(selected || null);
    setDinamicRubroId(rubroId);
    
    // Clear existing uniform items when changing rubro
    setUniformItems([]);
    setTotalAmount(0);

    if (selected) {
      // Update form with rubro info
      form.setFieldsValue({ 
        rubroId: rubroId,
        monto: selected.montoPreestablecido || 0
      });        // Fetch available uniform items for this rubro
        try {
          const uniformDetails = await rubroUniformeDetalleService.getRubroUniformeDetallesByRubroId(parseInt(rubroId));
          console.log('Fetched uniform details:', uniformDetails); // Debug log
          setAvailableUniformItems(uniformDetails);
        
        if (payFullUniform) {
          // Calculate total amount for full uniform
          const total = uniformDetails.reduce((sum, item) => sum + item.prendaUniformePrecio, 0);
          setTotalAmount(total);
          form.setFieldsValue({ monto: total });
        }
      } catch (error) {
        console.error('Error fetching uniform details:', error);
        toast.error('Error al cargar los detalles del uniforme');
      }
    } else {
      // Clear form when no rubro selected
      form.setFieldsValue({ 
        rubroId: undefined,
        monto: 0
      });
    }
  };

  // Check if form is ready for submission
  const isFormReadyForSubmission = (): boolean => {
    const hasStudent = !!selectedStudentDetails;
    const hasUniform = !!selectedRubro && dinamicRubroId !== "";
    const hasValidAmount = totalAmount > 0;
    const hasValidForm = isFormValid; // Include form validation
    
    if (payFullUniform) {
      return hasStudent && hasUniform && hasValidAmount && hasValidForm;
    } else {
      return hasStudent && hasUniform && uniformItems.length > 0 && hasValidAmount && hasValidForm;
    }
  };

  // Handle payment type change
  const handlePaymentTypeChange = (payFull: boolean) => {
    setPayFullUniform(payFull);
    setUniformItems([]);
    
    if (payFull && selectedRubro && availableUniformItems.length > 0) {
      // Check if all items have inventory when paying full uniform
      const itemsWithoutInventory = availableUniformItems.filter(item => getCurrentInventory(item) <= 0);
      
      if (itemsWithoutInventory.length > 0) {
        toast.warning(`Algunos artículos no tienen inventario disponible: ${itemsWithoutInventory.map(item => item.prendaUniformeDescripcion).join(', ')}`);
      }
      
      const total = availableUniformItems.reduce((sum, item) => sum + item.prendaUniformePrecio, 0);
      setTotalAmount(total);
      form.setFieldsValue({ monto: total });
    } else {
      setTotalAmount(0);
      form.setFieldsValue({ monto: 0 });
    }
  };

  // Helper function to get current inventory for an item
  const getCurrentInventory = (item: RubroUniformeDetalle): number => {
    // Debug logging to see what values we're getting
    console.log('Inventory calculation for item:', {
      description: item.prendaUniformeDescripcion,
      existenciaInicial: item.prendaUniformeExistenciaInicial,
      entradas: item.prendaUniformeEntradas,
      salidas: item.prendaUniformeSalidas
    });

    const existencia = item.prendaUniformeExistenciaInicial || 0;
    const entradas = item.prendaUniformeEntradas || 0;
    const salidas = item.prendaUniformeSalidas || 0;
    
    const inventory = existencia + entradas - salidas;
    console.log('Calculated inventory:', inventory);
    
    return inventory;
  };

  // Calculate total when uniform items change
  useEffect(() => {
    if (!payFullUniform) {
      const total = uniformItems.reduce((sum, item) => sum + item.subtotal, 0);
      setTotalAmount(total);
      form.setFieldsValue({ monto: total });
    }
  }, [uniformItems, payFullUniform, form]);

  // Add/Edit uniform item
  const handleAddItem = () => {
    setEditingItem(null);
    itemForm.resetFields();
    setItemModalVisible(true);
  };

  const handleEditItem = (item: UniformItem) => {
    setEditingItem(item);
    itemForm.setFieldsValue({
      rubroUniformeDetalleId: item.rubroUniformeDetalleId,
      cantidad: item.cantidad
    });
    setItemModalVisible(true);
  };

  const handleSaveItem = async () => {
    try {
      const values = await itemForm.validateFields();
      const selectedDetail = availableUniformItems.find(item => item.id === values.rubroUniformeDetalleId);
      
      if (!selectedDetail) {
        toast.error('Item de uniforme no encontrado');
        return;
      }

      // Calculate current inventory (initial + entries - exits)
      const currentInventory = getCurrentInventory(selectedDetail);

      // Check if there's enough inventory
      if (editingItem) {
        // When editing, calculate the net change in quantity
        const previousQuantity = editingItem.cantidad;
        const netQuantityChange = values.cantidad - previousQuantity;
        
        if (netQuantityChange > 0 && netQuantityChange > currentInventory) {
          toast.error(`No hay suficiente inventario para el incremento. Disponible: ${currentInventory}, Incremento solicitado: ${netQuantityChange}`);
          return;
        }
      } else {
        // When adding new item, check if requested quantity exceeds inventory
        if (values.cantidad > currentInventory) {
          toast.error(`No hay suficiente inventario. Disponible: ${currentInventory}, Solicitado: ${values.cantidad}`);
          return;
        }
      }

      const subtotal = selectedDetail.prendaUniformePrecio * values.cantidad;
      
      const newItem: UniformItem = {
        key: editingItem ? editingItem.key : Date.now().toString(),
        rubroUniformeDetalleId: selectedDetail.id,
        prendaUniformeId: selectedDetail.prendaUniformeId,
        descripcion: selectedDetail.prendaUniformeDescripcion,
        sexo: selectedDetail.prendaUniformeSexo,
        talla: selectedDetail.prendaUniformeTalla,
        precioUnitario: selectedDetail.prendaUniformePrecio,
        cantidad: values.cantidad,
        subtotal: subtotal,
        imageUrl: selectedDetail.prendaUniformeImagenUrl
      };

      if (editingItem) {
        setUniformItems(items => items.map(item => item.key === editingItem.key ? newItem : item));
        toast.success('Artículo actualizado correctamente');
      } else {
        // Check if item already exists
        const existingItem = uniformItems.find(item => item.rubroUniformeDetalleId === selectedDetail.id);
        if (existingItem) {
          toast.error('Este artículo ya está en la lista. Use editar para modificar la cantidad.');
          return;
        }
        setUniformItems(items => [...items, newItem]);
        toast.success('Artículo agregado correctamente');
      }

      setItemModalVisible(false);
    } catch (error) {
      console.error('Error saving uniform item:', error);
      toast.error('Error al guardar el artículo');
    }
  };

  const handleRemoveItem = (key: string) => {
    setUniformItems(items => items.filter(item => item.key !== key));
  };

  const handleViewImage = (imageUrl?: string) => {
    if (imageUrl) {
      setSelectedImageUrl(imageUrl);
      setImageModalVisible(true);
    } else {
      toast.info('No hay imagen disponible para este artículo');
    }
  };

  // Columns for uniform items table
  const uniformItemsColumns: ColumnsType<UniformItem> = [
    {
      title: 'Artículo',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
    {
      title: 'Sexo',
      dataIndex: 'sexo',
      key: 'sexo',
      render: (sexo: string) => (
        <Tag color={sexo === 'Masculino' ? 'blue' : sexo === 'Femenino' ? 'pink' : 'purple'}>
          {sexo}
        </Tag>
      ),
    },
    {
      title: 'Talla',
      dataIndex: 'talla',
      key: 'talla',
      render: (talla: string) => talla === '*' ? 'Todas' : talla,
    },
    {
      title: 'Precio Unit.',
      dataIndex: 'precioUnitario',
      key: 'precioUnitario',
      render: (precio: number) => `Q${precio.toFixed(2)}`,
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (subtotal: number) => `Q${subtotal.toFixed(2)}`,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewImage(record.imageUrl)}
            title="Ver imagen"
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditItem(record)}
            title="Editar"
          />
          <Popconfirm
            title="¿Eliminar este artículo?"
            onConfirm={() => handleRemoveItem(record.key)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="link"
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Eliminar"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Update form values when dinamicRubroId changes
  useEffect(() => {
    form.setFieldsValue({ rubroId: dinamicRubroId });
  }, [dinamicRubroId, form]);

  // Function to check if all required form fields are filled
  const checkFormValidity = useCallback(() => {
    try {
      const values = form.getFieldsValue();
      const required = ['cicloEscolar', 'fechaPago', 'monto'];
      
      // Check if all required fields have values
      const hasAllRequiredFields = required.every(field => {
        const value = values[field];
        
        if (field === 'fechaPago') {
          // For DatePicker, be very strict about what constitutes a valid value
          if (!value) return false;
          if (value === null || value === undefined) return false;
          if (typeof value !== 'object') return false;
          if (!value.isValid || typeof value.isValid !== 'function') return false;
          return value.isValid();
        }
        
        // For other fields, check they have meaningful values
        if (value === undefined || value === null || value === '') return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        return true;
      });
      
      const isValid = hasAllRequiredFields && !!selectedStudentDetails && !!selectedRubro && totalAmount > 0;
      
      // Force update if the validity state has changed
      if (isValid !== isFormValid) {
        setIsFormValid(isValid);
      }
      
      return isValid;
    } catch (error) {
      console.error('Error in form validation:', error);
      setIsFormValid(false);
      return false;
    }
  }, [form, selectedStudentDetails, selectedRubro, totalAmount, isFormValid]);

  // Watch for form field changes
  useEffect(() => {
    checkFormValidity();
    
    // Set up a polling mechanism to check form validity every 100ms
    // This ensures we catch any changes that might not trigger the normal events
    const interval = setInterval(() => {
      checkFormValidity();
    }, 100);
    
    return () => clearInterval(interval);
  }, [checkFormValidity]);

  // Additional effect to watch specifically for form changes
  useEffect(() => {
    // Force a validation check whenever dependencies change
    checkFormValidity();
  }, [selectedStudentDetails, selectedRubro, totalAmount, checkFormValidity]);

  // Reset form function
  const resetForm = () => {
    form.setFieldsValue({
      cicloEscolar: currentYear,
      fechaPago: dayjs(),
      medioPago: "1",
      notas: "",
      monto: undefined,
      rubroId: undefined,
      imagenesPago: [],
    });

    setSelectedStudent(null);
    setSelectedStudentDetails(null);
    setAlumnoId(null);
    setSelectedCodigo(null);
    setAutoCompleteValue("");
    setTypeaheadOptions([]);
    setDinamicRubroId("1");
    setSelectedRubro(null);
    setPayFullUniform(true);
    setUniformItems([]);
    setAvailableUniformItems([]);
    setTotalAmount(0);
    setIsFormValid(false);
    
    // Reset modal states for completeness
    setItemModalVisible(false);
    setEditingItem(null);
    setImageModalVisible(false);
    setSelectedImageUrl("");
  };

  // Search by codigo
  const handleCodigoSearch = async (codigo: string) => {
    try {
      const response = await makeApiRequest<AlumnoDetails>(`/alumnos/codigo/${codigo}`, "GET");
      
      // Reset uniform-related state when student changes
      setSelectedRubro(null);
      setDinamicRubroId("");
      setUniformItems([]);
      setAvailableUniformItems([]);
      setTotalAmount(0);
      
      // Reset form uniform fields
      form.setFieldsValue({
        rubroId: undefined,
        monto: 0
      });
      
      // Set new student data
      setAlumnoId(response.id.toString());
      setSelectedCodigo(response.codigo);
      const fullName = `${response.primerNombre} ${response.segundoNombre} ${response.primerApellido} ${response.segundoApellido}`.trim();
      setSelectedStudent(fullName);
      setSelectedStudentDetails(response);
      
      // Reset typeahead input to show the new student's name
      setAutoCompleteValue(fullName);
    } catch (error: unknown) {
      console.error("Error fetching student by code:", error);
      toast.error("No se encontró ningún alumno con ese código.");
    }
  };

  // Typeahead search
  const handleTypeaheadSearch = async (query: string) => {
    setAutoCompleteValue(query);
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setTypeaheadOptions([]);
      return;
    }
    try {
      const response = await makeApiRequest<Alumno[]>(`/alumnos/full`, "GET");
      const filtered = response.filter((alumno) =>
        alumno.fullName.toLowerCase().includes(trimmedQuery.toLowerCase())
      );
      const options = filtered.map((alumno) => ({
        value: alumno.id.toString(),
        label: alumno.fullName,
        codigo: alumno.codigo,
      }));
      setTypeaheadOptions(options);
    } catch (error: unknown) {
      console.error("Error searching for students:", error);
      toast.error("Error al buscar alumnos.");
    }
  };

  const handleTypeaheadSelect = async (value: string, option: AlumnoOption) => {
    setAutoCompleteValue(option.label);
    setAlumnoId(value);
    setSelectedStudent(option.label);
    
    // Reset uniform-related state when student changes
    setSelectedRubro(null);
    setDinamicRubroId("");
    setUniformItems([]);
    setAvailableUniformItems([]);
    setTotalAmount(0);
    
    // Reset form uniform fields
    form.setFieldsValue({
      rubroId: undefined,
      monto: 0
    });
    
    try {
      const response = await makeApiRequest<AlumnoDetails>(`/alumnos/codigo/${option.codigo}`, "GET");
      setSelectedStudentDetails(response);
      setSelectedCodigo(response.codigo);
    } catch (error: unknown) {
      console.error("Error fetching student details:", error);
      toast.error("Error al obtener los datos del alumno seleccionado.");
    }
  };

  // Submit form
  const handleSubmit = async (values: {
    cicloEscolar: string | number;
    fechaPago: dayjs.Dayjs;
    monto: number;
    medioPago: string;
    notas?: string;
    rubroId: string;
    imagenesPago?: { originFileObj?: File }[];
  }) => {
    if (!alumnoId) {
      toast.error("Por favor seleccione un alumno antes de enviar el pago.");
      return;
    }

    if (!payFullUniform && uniformItems.length === 0) {
      toast.error("Debe agregar al menos un artículo de uniforme para el pago.");
      return;
    }

    // Validate inventory before submitting
    if (payFullUniform) {
      const inventoryErrors = availableUniformItems.filter(item => getCurrentInventory(item) <= 0);
      if (inventoryErrors.length > 0) {
        toast.error(`No hay inventario suficiente para: ${inventoryErrors.map(item => item.prendaUniformeDescripcion).join(', ')}`);
        return;
      }
    } else {
      const inventoryErrors = uniformItems.filter(item => {
        const uniformItem = availableUniformItems.find(ui => ui.id === item.rubroUniformeDetalleId);
        return !uniformItem || getCurrentInventory(uniformItem) < item.cantidad;
      });

      if (inventoryErrors.length > 0) {
        toast.error('No hay inventario suficiente para algunos artículos seleccionados');
        return;
      }
    }

    setLoading(true);
    try {
      console.log("Form values received:", values);
      console.log("Images from form:", values.imagenesPago);
      
      const formData = new FormData();
      formData.append("Id", "0");
      formData.append("Fecha", values.fechaPago.toISOString());
      formData.append("CicloEscolar", values.cicloEscolar.toString());
      formData.append("Monto", values.monto.toString());
      formData.append("MedioPago", values.medioPago.toString());
      formData.append("MesColegiatura", currentMonth.toString());
      formData.append("RubroId", values.rubroId);
      formData.append("AlumnoId", alumnoId);
      formData.append("EsColegiatura", "false");
      formData.append("AnioColegiatura", new Date().getFullYear().toString());
      formData.append("EsPagoDeUniforme", "true");

      if (values.notas) formData.append("Notas", values.notas);

      const userId = getCurrentUserId();
      formData.append("UsuarioCreacionId", userId.toString());

      // Add uniform payment details
      const pagoDetalles: PagoDetalleCreateDto[] = payFullUniform
        ? availableUniformItems.map(item => ({
            rubroUniformeDetalleId: item.id,
            precioUnitario: item.prendaUniformePrecio,
            cantidad: 1,
            subtotal: item.prendaUniformePrecio
          }))
        : uniformItems.map(item => ({
            rubroUniformeDetalleId: item.rubroUniformeDetalleId,
            precioUnitario: item.precioUnitario,
            cantidad: item.cantidad,
            subtotal: item.subtotal
          }));

      pagoDetalles.forEach((detalle, index) => {
        formData.append(`PagoDetalles[${index}].RubroUniformeDetalleId`, detalle.rubroUniformeDetalleId.toString());
        formData.append(`PagoDetalles[${index}].PrecioUnitario`, detalle.precioUnitario.toString());
        formData.append(`PagoDetalles[${index}].Cantidad`, detalle.cantidad.toString());
        formData.append(`PagoDetalles[${index}].Subtotal`, detalle.subtotal.toString());
      });

      // Handle image uploads
      console.log("Processing images for upload:", values.imagenesPago);
      if (values.imagenesPago && Array.isArray(values.imagenesPago)) {
        console.log(`Found ${values.imagenesPago.length} images to upload`);
        values.imagenesPago.forEach((file, index) => {
          console.log(`Processing file ${index}:`, file);
          if (file.originFileObj) {
            console.log(`Appending file to FormData: ${file.originFileObj.name}`);
            formData.append("ImagenesPago", file.originFileObj);
          } else if (file instanceof File) {
            console.log(`Appending direct file to FormData: ${file.name}`);
            formData.append("ImagenesPago", file);
          } else {
            console.log("File object structure:", file);
          }
        });
      } else {
        console.log("No images found or not an array:", values.imagenesPago);
      }

      await makeApiRequest<{ id: number }>("/pagos", "POST", formData);

      toast.success("¡Pago de uniforme enviado con éxito!");
      resetForm();
    } catch (err: unknown) {
      console.error("Error details:", err);
      toast.error("Error al enviar el pago. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payments-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Title level={2}>Realizar un Pago de Uniforme</Title>
      
      {/* Student search section */}
      <Card title="Buscar Alumno" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <Input
            placeholder="Buscar por Código"
            style={{ width: 200 }}
            onPressEnter={(e) => handleCodigoSearch((e.target as HTMLInputElement).value)}
            suffix={<Button type="primary" onClick={() => {
              const input = document.querySelector('input[placeholder="Buscar por Código"]') as HTMLInputElement;
              if (input) handleCodigoSearch(input.value);
            }}>Buscar</Button>}
          />
          <AutoComplete
            style={{ width: 300 }}
            options={typeaheadOptions}
            value={autoCompleteValue}
            onSearch={handleTypeaheadSearch}
            onSelect={handleTypeaheadSelect}
            placeholder="Buscar por Nombre o Apellido"
          />
        </div>

        {selectedStudent && (
          <div style={{ padding: 16, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
            <p><strong>Alumno Seleccionado:</strong> {selectedStudent}</p>
            <p><strong>Código:</strong> {selectedCodigo}</p>
            {selectedStudentDetails && (
              <>
                <p><strong>Grado:</strong> {selectedStudentDetails.gradoNombre} {selectedStudentDetails.seccion}</p>
                {/* <p><strong>Sede:</strong> {selectedStudentDetails.sedeNombre}</p> */}
              </>
            )}
            <Button
              type="link"
              style={{ marginLeft: "10px", padding: "0" }}
              onClick={() => {
                resetForm();
              }}
            >
              Limpiar
            </Button>
          </div>
        )}
      </Card>

      {/* Payment form */}
      <Card title="Información del Pago">
        <Form form={form} layout="vertical" onFinish={handleSubmit} onValuesChange={checkFormValidity}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Form.Item label="Ciclo Escolar" name="cicloEscolar" initialValue={currentYear} rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={2020} max={2030} />
            </Form.Item>

            <Form.Item label="Fecha de Pago" name="fechaPago" initialValue={dayjs().startOf('day')} rules={[{ required: true, message: '¡Por favor seleccione la fecha de pago!' }]}>
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY" 
                defaultValue={dayjs().startOf('day')}
                onChange={(date) => {
                  // Immediately update the form field
                  form.setFieldsValue({ fechaPago: date });
                  
                  // Trigger form field validation immediately
                  form.validateFields(['fechaPago']).catch(() => {
                    // Ignore validation errors, they will be shown in the UI
                  });
                  
                  // Check validity immediately and with delays
                  const checkWithDelay = () => {
                    const isValid = checkFormValidity();
                    console.log(`Form validity check: ${isValid}, date value:`, date);
                  };
                  
                  checkWithDelay();
                  setTimeout(checkWithDelay, 10);
                  setTimeout(checkWithDelay, 50);
                  setTimeout(checkWithDelay, 100);
                  setTimeout(checkWithDelay, 200);
                }}
              />
            </Form.Item>

            <Form.Item label="Uniforme" name="rubroId" rules={[{ required: true, message: 'Seleccione un uniforme' }]}>
              <Select
                placeholder="Seleccionar uniforme"
                loading={loadingRubro}
                onChange={handleRubroChange}
                value={dinamicRubroId || undefined}
              >
                {uniformRubros.map(rubro => (
                  <Option key={rubro.id} value={rubro.id.toString()}>
                    {rubro.descripcion}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Medio de Pago" name="medioPago" initialValue="1" rules={[{ required: true }]}>
              <Select>
                <Option value="1">Efectivo</Option>
                <Option value="2">Tarjeta</Option>
                <Option value="3">Transferencia</Option>
                <Option value="4">Cheque</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Monto Total" name="monto" rules={[{ required: true }]}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                prefix="Q"
                readOnly
                value={totalAmount}
              />
            </Form.Item>
          </div>

          {/* Payment type selection */}
          {selectedRubro && (
            <Card title="Tipo de Pago de Uniforme" style={{ margin: '20px 0' }}>
              <Checkbox
                checked={payFullUniform}
                onChange={(e) => handlePaymentTypeChange(e.target.checked)}
              >
                Pagar uniforme completo (Q{availableUniformItems.reduce((sum, item) => sum + item.prendaUniformePrecio, 0).toFixed(2)})
              </Checkbox>
              
              {!payFullUniform && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={4}>Artículos de Uniforme</Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
                      Agregar Artículo
                    </Button>
                  </div>
                  
                  <Table
                    columns={uniformItemsColumns}
                    dataSource={uniformItems}
                    pagination={false}
                    size="small"
                    scroll={{ x: 800 }}
                  />
                  
                  {/* Total Display */}
                  {uniformItems.length > 0 && (
                    <div style={{ 
                      marginTop: 16, 
                      padding: '16px', 
                      backgroundColor: '#f0f9ff', 
                      border: '1px solid #91d5ff',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong>Total de Artículos: {uniformItems.length}</strong>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                        <strong>Total a Pagar: Q{totalAmount.toFixed(2)}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          <Form.Item label="Notas" name="notas">
            <Input.TextArea rows={3} placeholder="Agregar notas sobre el pago" />
          </Form.Item>

          <Form.Item label="Imágenes de Pago" name="imagenesPago">
            <Upload 
              beforeUpload={() => false} 
              multiple 
              listType="picture-card"
              accept="image/*"
              onPreview={(file) => {
                console.log("Preview clicked for file:", file); // Debug log
                console.log("file.url:", file.url); // Debug file URL
                console.log("file.originFileObj:", file.originFileObj); // Debug originFileObj
                console.log("file keys:", Object.keys(file)); // Debug all file properties
                
                // Create a preview URL for the file
                let url = '';
                let createdUrl = false;
                
                try {
                  if (file.url) {
                    url = file.url;
                    console.log("Using existing file.url:", url);
                  } else if (file.originFileObj) {
                    console.log("Creating URL from originFileObj...");
                    url = URL.createObjectURL(file.originFileObj);
                    createdUrl = true;
                    console.log("Created URL from originFileObj:", url);
                  } else if (file instanceof File) {
                    console.log("Creating URL from file directly...");
                    url = URL.createObjectURL(file);
                    createdUrl = true;
                    console.log("Created URL from file:", url);
                  }
                } catch (error) {
                  console.error("Error creating object URL:", error);
                }
                
                console.log("Final generated URL:", url); // Debug generated URL
                
                if (url) {
                  console.log("Opening image in new tab...");
                  window.open(url, '_blank');
                  
                  // Clean up the URL after a short delay
                  if (createdUrl && url) {
                    setTimeout(() => {
                      console.log("Cleaning up URL:", url);
                      URL.revokeObjectURL(url);
                    }, 2000);
                  }
                } else {
                  console.error("No URL available for preview", file);
                  // Try window.open as a fallback
                  if (file.originFileObj) {
                    const fallbackUrl = URL.createObjectURL(file.originFileObj);
                    window.open(fallbackUrl, '_blank');
                    // Clean up after a delay
                    setTimeout(() => URL.revokeObjectURL(fallbackUrl), 1000);
                  } else {
                    Modal.error({
                      title: 'Error',
                      content: 'No se pudo generar una vista previa de la imagen.',
                    });
                  }
                }
              }}
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
                showDownloadIcon: false,
              }}
              onChange={(info) => {
                // Update form field with file list
                form.setFieldsValue({
                  imagenesPago: info.fileList
                });
              }}
            >
              <Button icon={<UploadOutlined />}>Subir Imágenes de Pago</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              size="large"
              disabled={!isFormReadyForSubmission()}
            >
              Enviar Pago
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Add/Edit Item Modal */}
      <Modal
        title={editingItem ? 'Editar Artículo' : 'Agregar Artículo'}
        open={itemModalVisible}
        onOk={handleSaveItem}
        onCancel={() => setItemModalVisible(false)}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={itemForm} layout="vertical">
          <Form.Item
            label="Artículo de Uniforme"
            name="rubroUniformeDetalleId"
            rules={[{ required: true, message: 'Seleccione un artículo' }]}
          >
            <Select placeholder="Seleccione un artículo">
              {availableUniformItems.map(item => {
                const currentInventory = getCurrentInventory(item);
                return (
                  <Option key={item.id} value={item.id}>
                    {item.prendaUniformeDescripcion} - {item.prendaUniformeSexo} - {item.prendaUniformeTalla === '*' ? 'Todas' : item.prendaUniformeTalla} - Q{item.prendaUniformePrecio.toFixed(2)}
                    {currentInventory <= 0 && <span style={{ color: 'red' }}> (Sin inventario)</span>}
                    {currentInventory > 0 && currentInventory <= 5 && <span style={{ color: 'orange' }}> (Bajo inventario: {currentInventory})</span>}
                    {currentInventory > 5 && <span style={{ color: 'green' }}> (Disponible: {currentInventory})</span>}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Cantidad"
            name="cantidad"
            rules={[
              { required: true, message: 'Ingrese la cantidad' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const selectedId = getFieldValue('rubroUniformeDetalleId');
                  if (selectedId && value) {
                    const selectedItem = availableUniformItems.find(item => item.id === selectedId);
                    if (selectedItem) {
                      const currentInventory = getCurrentInventory(selectedItem);
                      
                      if (editingItem) {
                        // For editing, check net change
                        const netChange = value - editingItem.cantidad;
                        if (netChange > 0 && netChange > currentInventory) {
                          return Promise.reject(new Error(`Incremento excede inventario disponible (${currentInventory})`));
                        }
                      } else {
                        // For new items, check absolute value
                        if (value > currentInventory) {
                          return Promise.reject(new Error(`Cantidad excede el inventario disponible (${currentInventory})`));
                        }
                      }
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            initialValue={1}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Modal */}
      <Modal
        title="Imagen del Artículo"
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={null}
        width={600}
      >
        <Image
          width="100%"
          src={selectedImageUrl}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
        />
      </Modal>
    </div>
  );
};

export default UniformPayments;
