/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { MonthPickerInput } from '@mantine/dates';
import { Formik, Form, FieldArray } from 'formik';

import { DateCurrent } from '../../../../../utils/functions';

import moment from 'moment';

import { GetReporte_xMes } from '../../../../../redux/actions/aReporte';
import { clearReport_xMes } from '../../../../../redux/states/reporte';

import './reporteMensual.scss';
import LoaderSpiner from '../../../../../components/LoaderSpinner/LoaderSpiner';

const ReporteMesual = () => {
  const dispatch = useDispatch();
  const isInitialRender = useRef(true);
  const [datePrincipal, setDatePrincipal] = useState(new Date());

  const [infoReport, setInfoReport] = useState([]);

  const infoReporte = useSelector((state) => state.reporte.reportMes);

  const generateDateArray = () => {
    const firstDayOfMonth = moment(datePrincipal).startOf('month');
    const lastDayOfMonth = moment(datePrincipal).endOf('month');
    const formattedDateArray = [];

    let currentDate = moment(firstDayOfMonth);
    while (currentDate <= lastDayOfMonth) {
      formattedDateArray.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'day');
    }

    return formattedDateArray;
  };

  const getInforme = () => {
    const datesMonth = generateDateArray();

    datesMonth.map((date) => dispatch(GetReporte_xMes(date)));
  };

  useEffect(() => {
    setIsLoading(true);

    if (infoReporte.length === generateDateArray().length) {
      const formattedResponse = infoReporte.map((dayData) => {
        const categories = ['Ropa x Kilo', 'Edredon', 'Planchado', 'Zapatillas', 'Cortinas', 'Otros', 'Delivery'];

        const dayDataWithEmptyCategories = categories.map((category) => {
          const foundItem = dayData.InfoCategoria.find((item) => item.Categoria === category);
          if (foundItem) {
            return {
              Categoria: foundItem.Categoria,
              Cantidad: parseFloat(foundItem.Cantidad) || 0,
            };
          } else {
            return { Categoria: category, Cantidad: 0 };
          }
        });

        return {
          FechaEntrega: dayData.FechaPrevista,
          CantidadPedido: dayData.CantidadPedido,
          InfoCategoria: dayDataWithEmptyCategories,
        };
      });

      const hasOtros = formattedResponse.some((dayData) =>
        dayData.InfoCategoria.some((item) => item.Categoria === 'Otros')
      );

      if (!hasOtros) {
        formattedResponse.forEach((dayData) => {
          dayData.InfoCategoria.push({ Categoria: 'Otros', Cantidad: 0 });
        });
      }

      formattedResponse.sort((a, b) => moment(a.FechaEntrega).diff(moment(b.FechaEntrega)));

      setInfoReport(formattedResponse);
      setIsLoading(false);
    }
  }, [infoReporte, datePrincipal]);

  useEffect(() => {
    if (!isInitialRender.current) {
      dispatch(clearReport_xMes());
      getInforme();
    } else {
      isInitialRender.current = false;
    }
  }, [datePrincipal, dispatch]);

  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="content-inform-m" style={isLoading ? null : { border: 'solid 1px silver' }}>
      {isLoading ? (
        <div className="loading-general">
          <LoaderSpiner />
        </div>
      ) : (
        <>
          <h1>Informe Mensual</h1>
          <div className="filter-date">
            <MonthPickerInput
              label="Ingrese Fecha"
              placeholder="Pick date"
              value={datePrincipal}
              onChange={(date) => {
                setDatePrincipal(date);
              }}
              mx="auto"
              maw={400}
            />
          </div>
          <Formik
            initialValues={{
              fEntrega: [],
            }}
          >
            {({ values }) => (
              <Form className="container-informe">
                <div className="informe-body">
                  <FieldArray name="fEntrega">
                    {() => (
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Fecha Entrega</th>
                              <th>Cantidad</th>
                              <th>Ropa x Kilo</th>
                              <th>Edredones</th>
                              <th>Planchado</th>
                              <th>Zapatillas</th>
                              <th>Cortinas</th>
                              <th>Otros</th>
                              <th>Delivery</th>
                            </tr>
                          </thead>
                          <tbody>
                            {infoReport.map((dayData, index) => (
                              <tr
                                key={index}
                                style={{
                                  background: DateCurrent().format4 === dayData.FechaEntrega ? '#ffd9d9' : null,
                                }}
                                data-fechaentrega={dayData.FechaEntrega}
                                ref={(element) => {
                                  if (element && DateCurrent().format4 === element.getAttribute('data-fechaentrega')) {
                                    element.scrollIntoView({
                                      behavior: 'smooth',
                                      block: 'start',
                                    });
                                  }
                                }}
                              >
                                <td>{dayData.FechaEntrega}</td>
                                <td>{dayData.CantidadPedido}</td>
                                {dayData.InfoCategoria.map((item, itemIndex) => (
                                  <td key={itemIndex}>
                                    {item.Cantidad % 1 !== 0 ? parseFloat(item.Cantidad).toFixed(2) : item.Cantidad}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </Form>
            )}
          </Formik>
        </>
      )}
    </div>
  );
};

export default ReporteMesual;
