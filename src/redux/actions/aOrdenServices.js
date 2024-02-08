import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { UpdateNextCodigo } from './aCodigo';
import { AddDelivery } from './aDelivery';
import {
  handleAddCliente,
  createPuntosObj,
  UpdateDeliveryID,
  handleUseCupon,
  handleRegisterCupon,
  handleRemoveFStorage,
} from '../../services/default.services';
import { Notify } from '../../utils/notify/notify';
import { socket } from '../../utils/socket/connect';

export const GetOrdenServices_Date = createAsyncThunk('service_order/GetOrdenServices_Date', async (datePago) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-factura/date/${datePago}`);
    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    console.log(error.response.data.mensaje);
    Notify('Error', 'No se pudo obtemer la lista de Ordenes de Servicio', 'fail');
    throw new Error(error);
  }
});

export const GetOrdenServices_DateRange = createAsyncThunk(
  'service_order/GetOrdenServices_DateRange',
  async ({ dateInicio, dateFin }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-factura/date/${dateInicio}/${dateFin}`
      );
      return response.data;
    } catch (error) {
      // Puedes manejar los errores aquí
      //Notify('Error', 'No se ontemer la lista de Ordenes de Servicio', 'fail');
      console.log(error.response.data.mensaje);
      throw new Error(`No se pudo actualizar el cliente - ${error}`);
    }
  }
);

export const AddOrdenServices = createAsyncThunk('service_order/AddOrdenServices', async (infoRecibo, { dispatch }) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/add-factura`, infoRecibo);

    if (response.data) {
      socket.emit('client:change-info', response.data);

      dispatch(UpdateNextCodigo());

      const res = response.data;
      const beneficios = res.cargosExtras.beneficios;

      if (beneficios.puntos > 0) {
        // si uso puntos es q hay cliente
        const puntosToDeduct = createPuntosObj(res, -res.cargosExtras.beneficios.puntos); // reducir puntos a erse cliente

        await handleAddCliente(puntosToDeduct);
      }
      if (res.modoDescuento === 'Promocion' && beneficios.promociones.length > 0) {
        beneficios.promociones.map(async (cupon) => {
          await handleUseCupon(cupon.codigoCupon);
        });
      }
      if (res.gift_promo.length > 0) {
        await handleRegisterCupon(res.gift_promo);
      }
    }

    return response.data;
  } catch (error) {
    console.log(error.response.data.mensaje);
    Notify('Error', 'No se registro la Orden de Servicio', 'fail');
    throw new Error(error);
  }
});

export const AddOrdenServices_Old = createAsyncThunk('service_order/AddOrdenServices', async (infoRecibo) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/add-factura`, infoRecibo);
    socket.emit('client:change-info', response.data);
    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    console.log(error.response.data.mensaje);
    Notify('Error', 'No se registro la Orden de Servicio', 'fail');
    throw new Error(error);
  }
});

// En este caso la info de recibo es incompleta y de delivery es completa
export const ReserveOrdenServices = createAsyncThunk(
  'service_order/ReserveOrdenServices',
  async ({ info, infoDelivery }, { dispatch }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/add-factura`, info);
      const data = response.data;
      if (data) {
        socket.emit('client:change-info', data);
        dispatch(UpdateNextCodigo());
        dispatch(AddDelivery({ ...infoDelivery, idCliente: data._id }));
      }

      return data;
    } catch (error) {
      // Puedes manejar los errores aquí
      console.log(error.response.data.mensaje);
      Notify('Error', 'No se registro la reserva', 'fail');
      throw new Error(error);
    }
  }
);

// En este caso la info tanto de recibo como delivery es completa
export const AddOrdenServices_Delivery = createAsyncThunk(
  'service_order/AddOrdenServices_Delivery',
  async ({ infoRecibo, infoDelivery }, { dispatch }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/add-factura`, infoRecibo);
      if (response.data) {
        const data = response.data;
        socket.emit('client:change-info', data);
        const beneficios = data.cargosExtras.beneficios;
        await dispatch(UpdateNextCodigo());
        await dispatch(AddDelivery({ ...infoDelivery, idCliente: data._id }));

        if (data.gift_promo.length > 0) {
          await handleRegisterCupon(data.gift_promo);
        }
        if (data.modoDescuento === 'Puntos' && beneficios.puntos > 0) {
          // si uso puntos es q hay cliente
          const puntosToDeduct = createPuntosObj(data, -data.cargosExtras.beneficios.puntos); // reducir puntos a erse cliente
          await handleAddCliente(puntosToDeduct);
        }
        if (data.modoDescuento === 'Promocion' && beneficios.promociones.length > 0) {
          beneficios.promociones.map(async (cupon) => {
            await handleUseCupon(cupon.codigoCupon);
          });
        }
      }

      return response.data;
    } catch (error) {
      console.log(error.response.data.mensaje);
      Notify('Error', 'No se registro la Orden de Servicio', 'fail');
      throw new Error(error);
    }
  }
);

export const UpdateOrdenServices = createAsyncThunk('service_order/UpdateOrdenServices', async ({ id, updateData }) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/update-factura/${id}`,
      updateData
    );

    const data = response.data;

    socket.emit('client:change-info', response.data);
    // socket.emit('client:change-info:child', response.data);

    const beneficios = data.cargosExtras.beneficios;
    if (data && updateData.infoRecibo.estadoPrenda === 'pendiente' && data.Modalidad === 'Delivery') {
      await UpdateDeliveryID(id, { newName: data.Nombre }); // Nombre
      if (data.gift_promo.length > 0) {
        await handleRegisterCupon(response.data.gift_promo);
      }
      if (data.modoDescuento === 'Puntos' && beneficios.puntos > 0) {
        // si uso puntos es q hay cliente
        const puntosToDeduct = createPuntosObj(data, -data.cargosExtras.beneficios.puntos); // reducir puntos a erse cliente
        await handleAddCliente(puntosToDeduct);
      }
      if (data.modoDescuento === 'Promocion' && beneficios.promociones.length > 0) {
        beneficios.promociones.map(async (cupon) => {
          await handleUseCupon(cupon.codigoCupon);
        });
      }
    }

    return data;
  } catch (error) {
    console.log(error);
    // Puedes manejar los errores aquí
    console.log(error.response.data.mensaje);
    Notify('Error', 'No se actualizo la Orden de Servicio', 'fail');
    throw new Error(error);
  }
});

export const UpdateOrdenServices_PagoEntrega = createAsyncThunk(
  'service_order/UpdateOrdenServices_PagoEntrega',
  async ({ id, info, infoDelivery, preLocation }, { dispatch }) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/update-factura/${id}`, info);

      if (response.data) {
        const res = response.data;
        socket.emit('client:change-info', res);
        // socket.emit('client:change-info:child', res);
        const score = parseInt(res.totalNeto);

        if (res.Pago === 'Completo' && res.estadoPrenda === 'entregado' && res.dni !== '') {
          const puntosObj = createPuntosObj(res, score);
          await handleAddCliente(puntosObj);
        }

        if (res.location === 1 && preLocation === 2) {
          handleRemoveFStorage(id);
        }
        if (infoDelivery !== '' && info.infoRecibo.Modalidad === 'Delivery') {
          dispatch(AddDelivery({ ...infoDelivery, idCliente: response.data._id }));
        }
      }

      return response.data;
    } catch (error) {
      console.log(error.response.data.mensaje);
      Notify('Error', 'No se realizo puedo realizar la Entrega y/o Pago del la Orden de Servicio', 'fail');
      throw new Error(error);
    }
  }
);

export const CancelEntrega_OrdenService = createAsyncThunk('service_order/CancelEntrega_OrdenService', async (id) => {
  try {
    // Lógica para cancelar entrega en el backend
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/cancel-entrega/${id}`);
    const { orderUpdate, idDeliveryDeleted } = response.data;

    socket.emit('client:cancel-delivery', idDeliveryDeleted);
    socket.emit('client:change-info', orderUpdate);
    Notify('Éxito', 'Entrega y/o Pago de la Orden de Servicio cancelada correctamente', 'success');

    return orderUpdate;
  } catch (error) {
    console.error('Error al cancelar entrega:', error);
    Notify('Error', 'No se pudo realizar la cancelación de la Orden de Servicio', 'fail');
    throw new Error(error);
  }
});
