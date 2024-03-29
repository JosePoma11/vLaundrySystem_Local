import { createSlice } from '@reduxjs/toolkit';
import { GetCuadre, GetLastCuadre } from '../actions/aCuadre';
import { MONTOS_BASE } from '../../services/global';

const cuadre = createSlice({
  name: 'cuadre',
  initialState: {
    infoCuadre: null,
    lastCuadre: null,
    infoBase: null,
    cuadreActual: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    LS_updateCuadre: (state, action) => {
      state.infoCuadreDate = action.payload;
    },
    setCuadrePrincipal: (state, action) => {
      state.cuadrePrincipal = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // List Cuadres
      .addCase(GetCuadre.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetCuadre.fulfilled, (state, action) => {
        state.isLoading = false;
        const lastCuadre = action.payload.lastCuadre;
        const cuadreActual = action.payload.cuadreActual;
        const infoBase = {
          ...action.payload.infoBase,
          Montos: MONTOS_BASE,
        };

        const listCuadres = action.payload.listCuadres;
        const newListCuadres = listCuadres?.length > 0 ? listCuadres.filter((c) => c._id !== cuadreActual._id) : [];
        state.infoCuadre = newListCuadres;
        state.lastCuadre = lastCuadre;
        state.lastCuadre = lastCuadre;
        state.infoBase = infoBase;

        if (!cuadreActual.saved) {
          state.cuadreActual = { ...cuadreActual, Montos: MONTOS_BASE };
        } else {
          state.cuadreActual = cuadreActual;
        }
      })
      .addCase(GetCuadre.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // // Saved Cuadre
      // .addCase(SaveCuadre.pending, (state) => {
      //   state.isLoading = true;
      //   state.infoCuadreDate = false;
      //   state.error = null;
      // })
      // .addCase(SaveCuadre.fulfilled, (state, action) => {
      //   state.isLoading = false;
      //   state.infoCuadreDate = action.payload;
      // })
      // .addCase(SaveCuadre.rejected, (state, action) => {
      //   state.isLoading = false;
      //   state.infoCuadreDate = false;
      //   state.error = action.error.message;
      // })
      // List LastCuadre
      .addCase(GetLastCuadre.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetLastCuadre.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastCuadre = action.payload;
      })
      .addCase(GetLastCuadre.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { LS_updateCuadre, setCuadrePrincipal } = cuadre.actions;
export default cuadre.reducer;
