/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react';
import { DiasAttencion, HoraAttencion, handleGetInfoPago, roundDecimal } from '../../../../../../../utils/functions';
import './ticket.scss';

import Pet from './pet.jpg';
import AhorroPet from './petAhorro.jpg';
import moment from 'moment';
import axios from 'axios';
import { nameImpuesto, politicaAbandono, simboloMoneda } from '../../../../../../../services/global';

const Ticket = React.forwardRef((props, ref) => {
  const { forW, infoOrden, InfoNegocio } = props;
  const [listPromos, setListPromos] = useState([]);

  const montoDelivery = (dataC) => {
    if (dataC.Modalidad === 'Delivery') {
      return infoOrden.Producto.find((p) => p.producto === 'Delivery').total;
    } else {
      return 0;
    }
  };

  const calcularFechaFutura = (numeroDeDias) => {
    const fechaActual = moment();
    const nuevaFecha = fechaActual.clone().add(numeroDeDias, 'days');
    return nuevaFecha.format('D [de] MMMM[, del] YYYY');
  };

  const handleGetInfoPromo = async (codigoCupon) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-info-promo/${codigoCupon}`);
      return response.data;
    } catch (error) {
      // Maneja los errores aquí
      console.error(`No se pudo obtener información de la promoción - ${error}`);
      throw error; // Lanza el error para que pueda ser capturado por Promise.all
    }
  };

  const handleShowDateTime = (date, hour) => {
    // Concatena la fecha y hora
    const datetimeString = `${date} ${hour}`;

    // Parsea la fecha y hora usando Moment.js
    const dateTime = moment(datetimeString, 'YYYY-MM-DD HH:mm');

    // Formatea la fecha y la hora según los requisitos
    const formattedDate = dateTime.format('D [de] MMMM, YYYY');
    const formattedTime = dateTime.format('dddd / hh:mm a');

    // Construye el objeto de respuesta
    const result = {
      FInfoD: formattedDate,
      SInfoD: formattedTime,
    };

    return result;
  };

  const spaceLine = (txt) => {
    // Separar el string por saltos de línea ("\n")
    const lines = txt.split('\n');

    // Devolver un elemento <ol> con elementos <li> numerados para cada línea
    return (
      <ol className="formatted-list">
        {lines.map((line, index) => (
          <li key={index} className="formatted-line">
            <p>
              {line.includes('✔ ') ? (
                <>
                  {line.replace('✔ ', ``)}
                  <br />
                </>
              ) : (
                line
              )}
            </p>
          </li>
        ))}
      </ol>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (infoOrden?.gift_promo.length > 0) {
        const promos = infoOrden.gift_promo;

        try {
          // Utiliza Promise.all para esperar a que todas las llamadas asincrónicas se completen
          const results = await Promise.all(
            promos.map(async (promo) => {
              return await handleGetInfoPromo(promo.codigoCupon);
            })
          );

          setListPromos(results);
        } catch (error) {
          // Maneja los errores aquí
          console.error('Error al obtener información de las promociones:', error);
        }
      }
    };

    fetchData();
  }, [infoOrden]);

  return (
    <>
      {infoOrden ? (
        <div className="container-ticket" ref={ref}>
          <div className="body-orden-service">
            <div className="receipt_header">
              <div className="name-bussiness">
                <h1>LAVANDERIA Y TINTORERIA</h1>
                <h1>{InfoNegocio?.name}</h1>
              </div>
              <table className="info-table">
                <tbody>
                  <tr>
                    <td>Local:</td>
                    <td>{InfoNegocio?.direccion}</td>
                  </tr>
                  <tr>
                    <td>Horario:</td>
                    <td>
                      {Object.keys(InfoNegocio).length > 0 ? (
                        <>
                          {DiasAttencion(InfoNegocio?.horario.dias)}
                          <hr style={{ visibility: 'hidden' }} />
                          {HoraAttencion(InfoNegocio?.horario.horas)}
                        </>
                      ) : null}
                    </td>
                  </tr>
                  {InfoNegocio?.numero?.state ? (
                    <tr>
                      <td>Celular:</td>
                      <td>{InfoNegocio?.numero?.info}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <div className="info-client">
              <div className="cod-rec">
                <h1 className="cod-rec">N° Orden : {infoOrden.codRecibo}</h1>
              </div>
              <div className="info-detail">
                <table className="tb-date">
                  <tbody>
                    <tr>
                      <td>Recojo:</td>
                      <td>
                        <div className="date-time">
                          <span>
                            {handleShowDateTime(infoOrden.dateRecepcion.fecha, infoOrden.dateRecepcion.hora).SInfoD}
                          </span>
                          <span>
                            {handleShowDateTime(infoOrden.dateRecepcion.fecha, infoOrden.dateRecepcion.hora).FInfoD}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>Entrega:</td>
                      <td>
                        <div className="date-time">
                          <span>
                            {handleShowDateTime(infoOrden.datePrevista.fecha, infoOrden.datePrevista.hora).SInfoD}
                          </span>
                          <span>
                            {handleShowDateTime(infoOrden.datePrevista.fecha, infoOrden.datePrevista.hora).FInfoD}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className="tb-info-cliente">
                  <tbody>
                    <tr>
                      <td>Nombre: </td>
                      <td>&nbsp;&nbsp;{infoOrden.Nombre}</td>
                    </tr>
                    <tr>
                      <td>Telefono: </td>
                      <td>&nbsp;&nbsp;{infoOrden.celular}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="receipt_body">
              <div className="items">
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Producto</th>
                      <th>Cant</th>
                      <th>Subt</th>
                    </tr>
                    {/* <tr>
                      <th></th>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                    </tr> */}
                  </thead>
                  <tbody>
                    {infoOrden.Producto.filter((p) => p.categoria !== 'Delivery').map((p, index) => (
                      <React.Fragment key={`${infoOrden._id}-${index}`}>
                        <tr>
                          <td>•</td>
                          <td>{p.producto}</td>
                          <td>{p.producto === 'Ropa x Kilo' ? roundDecimal(p.cantidad) : parseInt(p.cantidad)}</td>
                          <td>{roundDecimal(p.total)}</td>
                        </tr>
                        {forW && p.descripcion ? (
                          <tr className="fila_descripcion">
                            <td colSpan="4">{spaceLine(p.descripcion)}</td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3">Subtotal</td>
                      <td>
                        {roundDecimal(
                          infoOrden.Producto.reduce((total, p) => total + parseFloat(p.total), 0) -
                            montoDelivery(infoOrden)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3">Delivery</td>
                      <td>{montoDelivery(infoOrden)}</td>
                    </tr>
                    {infoOrden.factura ? (
                      <tr>
                        <td colSpan="3">
                          {nameImpuesto} ({infoOrden.cargosExtras.igv.valor * 100} %) :
                        </td>
                        <td>{infoOrden.cargosExtras.igv.importe}</td>
                      </tr>
                    ) : null}
                    <tr>
                      <td colSpan="3">Descuento</td>
                      <td>{infoOrden.descuento ? infoOrden.descuento : 0}</td>
                    </tr>
                    <tr>
                      <td colSpan="3">Total</td>
                      <td>{roundDecimal(infoOrden.totalNeto)}</td>
                    </tr>
                  </tfoot>
                </table>
                {infoOrden.modoDescuento === 'Promocion' && infoOrden.descuento > 0 ? (
                  <div className="space-ahorro">
                    <h2 className="title">! Felicidades Ahorraste S/{infoOrden?.descuento} ¡</h2>
                    <div className="info-promo">
                      <span>Usando nuestras promociones :</span>
                      <div className="body-ahorro">
                        <div className="list-promo">
                          <ul>
                            {infoOrden.cargosExtras.beneficios.promociones.map((p) => (
                              <li key={p.codigoCupon}>{p.descripcion}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="img-pet">
                          <img src={AhorroPet} alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="monto-final">
              <h2>
                Pago : {simboloMoneda} {handleGetInfoPago(infoOrden.ListPago, infoOrden.totalNeto).pago}
              </h2>
              <h3 className={`${infoOrden.factura ? null : 'sf'} estado`}>
                {handleGetInfoPago(infoOrden.ListPago, infoOrden.totalNeto).estado.toUpperCase()}
              </h3>
              {infoOrden.factura ? <h2 className="cangeo-factura">Canjear Orden de Servicio por Factura</h2> : null}
            </div>
            <p className="aviso">
              NOTA: <span>{politicaAbandono.mResaltado}</span>
              {politicaAbandono.mGeneral}
            </p>
          </div>
          {listPromos.length > 0 ? (
            <div className="container-promociones">
              {listPromos?.map((promo, index) => (
                <div className="item-promo" key={index}>
                  <div className="info-promo">
                    <div>
                      <h1>PROMOCION:</h1>
                      <h2 style={{ fontSize: '0.8em', textAlign: 'justify' }}>{promo.descripcion}</h2>
                      <h2 className="cod-i">codigo: {promo.codigoCupon}</h2>
                    </div>
                    <div className="img-pet">
                      <img src={Pet} alt="" />
                    </div>
                  </div>
                  <div className="notice">
                    <span>CÁNJELO EN SU PRÓXIMA ORDEN</span>
                  </div>
                  <h2 className="vigencia" style={{ float: 'right', fontSize: '0.78em' }}>
                    Vencimiento : {calcularFechaFutura(promo.vigencia)}
                  </h2>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div>Loading...</div>
        </>
      )}
    </>
  );
});

export default Ticket;
