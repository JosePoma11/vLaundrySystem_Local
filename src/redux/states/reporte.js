import { createSlice } from '@reduxjs/toolkit';
import { GetReporte_xMes, GetReporte_xDia } from '../actions/aReporte';

const reporte = createSlice({
  name: 'reporte',
  initialState: {
    infoReporte: false,
    reportMes: [],
    reportDia: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearReport_xMes: (state) => {
      state.infoReporte = false;
      state.reportMes = [];
      state.isLoading = false;
      state.error = null;
    },
    clearReport_xDia: (state) => {
      state.reportDia = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(GetReporte_xMes.pending, (state) => {
        state.isLoading = true;
        state.infoReporte = false;
        state.error = null;
      })
      .addCase(GetReporte_xMes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoReporte = true;
        state.reportMes.push(action.payload);
      })
      .addCase(GetReporte_xMes.rejected, (state, action) => {
        state.isLoading = false;
        state.infoReporte = false;
        state.error = action.error.message;
      })
      // List x dia
      .addCase(GetReporte_xDia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetReporte_xDia.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reportDia.push(action.payload);
      })
      .addCase(GetReporte_xDia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearReport_xMes, clearReport_xDia } = reporte.actions;

export default reporte.reducer;
