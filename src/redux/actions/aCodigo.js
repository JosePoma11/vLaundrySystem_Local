import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Notify } from '../../utils/notify/notify';
import { socket } from '../../utils/socket/connect';

export const UpdateNextCodigo = createAsyncThunk('codigo/UpdateNextCodigo', async () => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/update-next-cod`);
    socket.emit('client:change-cod', response.data);
    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    console.log(error.response.data.mensaje);
    Notify('Error', 'Codigo de Orden de Sercio no se pudo aumentar', 'fail');
    throw new Error(error);
  }
});

export const GetCodigos = createAsyncThunk('codigo/GetCodigos', async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-cod`);
    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    console.log(error.response.data.mensaje);
    throw new Error(`Error al Obtener codigo de Orden de Servicio - ${error}`);
  }
});
