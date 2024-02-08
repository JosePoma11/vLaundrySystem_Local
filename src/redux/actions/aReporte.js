import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Notify } from '../../utils/notify/notify';

export const GetReporte_xMes = createAsyncThunk('reporte/GetReporte_xMes', async (date) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-factura/report/date-prevista/${date}`
    );

    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    console.log(error.response.data.mensaje);
    Notify('Error', 'No se pudieron obtener los datos de REPORTE MENSUAL', 'fail');
    throw new Error('No se pudieron obtener los datos de REPORTE MENSUAL');
  }
});

export const GetReporte_xDia = createAsyncThunk('reporte/GetReporte_xDia', async (date) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-factura/report/date-prevista/${date}`
    );

    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    console.log(error.response.data.mensaje);
    Notify('Error', 'No se pudieron obtener los datos de REPORTE DIARIO', 'fail');
    throw new Error('No se pudieron obtener los datos de REPORTE DIARIO');
  }
});
