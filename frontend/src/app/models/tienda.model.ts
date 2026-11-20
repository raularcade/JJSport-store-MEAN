export interface Nutrientes {
    energiaKcal: number;
    proteinas: number;
    hidratos: number;
    grasas: number;
    fibra?: number;
    sal?: number;
    cafeinaMg?: number;
    creatinaG?: number;
    sodioMg?: number;
    potasioMg?: number;
    magnesioMg?: number;
    epaMg?: number;
    dhaMg?: number;
  }
  
  export interface Variante {
    _id: string;
    sabor: string;
    formato: string;
    precio: number;
    stock: number;
  }
  
  export interface Producto {
    _id: string;
    nombre: string;
    img?: string;
    marca: string;
    descripcion: string;
    categoria: 'proteinas' | 'creatina' | 'pre-entreno' | 'vitaminas' | 'hidratacion';
    objetivo: 'hipertrofia' | 'resistencia' | 'recuperacion';
    etiquetas: string[];
    dosisRecomendada: string;
    variantes: Variante[];
    tablaNutricional?: {
      por100g?: Nutrientes;
      porToma?: Nutrientes;
    };
    nutrientesPor100g?: Nutrientes;
    nutrientesPorToma?: Nutrientes;
  }
  
  export interface ItemCarrito {
    productoId: string;
    varianteId: string;
    nombre: string;
    marca: string;
    sabor: string;
    formato: string;
    precio: number;
    stockMax: number;
    cantidad: number;
    img?: string;
  }
  
  export interface PedidoPayload {
    cliente: {
      nombre: string;
      email: string;
      telefono: string;
      direccion: string;
    };
    lineas: {
      productoId: string;
      varianteId: string;
      cantidad: number;
    }[];
  }
  
  export interface PedidoCreado {
    _id: string;
    cliente: {
      nombre: string;
      email: string;
      telefono?: string;
      direccion: string;
    };
    lineas: {
      nombre: string;
      sabor: string;
      formato: string;
      precio: number;
      cantidad: number;
    }[];
    total: number;
    estado: string;
    createdAt: string;
  }