import moment from 'moment';
import 'moment/locale/es';

export function DateCurrent() {
  const obtenerFechaHoraLocal = () => moment();

  const fechaHora = obtenerFechaHoraLocal();

  const dia = fechaHora.format('DD');
  const mes = fechaHora.format('MM');
  const año = fechaHora.format('YYYY');
  const hora = fechaHora.format('hh:mm a');
  const minutos = fechaHora.format('mm');

  const mesTexto = fechaHora.format('MMMM');

  return {
    format1: `${año}`,
    format2: `${dia} de ${mesTexto} de ${año}, ${hora}:${minutos}`,
    format3: `${hora}`,
    format4: `${año}-${mes}-${dia}`,
  };
}

export function DateDetail_Hora(fecha, hora) {
  const fechaHora = moment(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm');
  return fechaHora.format('dddd, D MMMM [de] YYYY - hh:mm a');
}

export function DateDetail(date) {
  moment.locale('es');
  const fechaOriginal = moment(date);
  const fechaTransformada = fechaOriginal.format('dddd, D [de] MMMM [de] YYYY');

  return fechaTransformada;
}

export function GetFirstFilter() {
  moment.locale('es');
  const currentDate = moment();
  const previousMonth = currentDate.clone().subtract(1, 'month').startOf('month');

  const formattedDates = [previousMonth.format('YYYY-MM-DD'), currentDate.format('YYYY-MM-DD')];

  const formattedMonths = `${previousMonth.format('MMMM')} - ${currentDate.format('MMMM')}`;

  return { formatoD: formattedDates, formatoS: formattedMonths };
}

export const calcularFechaFutura = (numeroDeDias) => {
  const fechaActual = moment();
  const nuevaFecha = fechaActual.clone().add(numeroDeDias, 'days');
  return nuevaFecha.format('D [de] MMMM[, del] YYYY');
};
