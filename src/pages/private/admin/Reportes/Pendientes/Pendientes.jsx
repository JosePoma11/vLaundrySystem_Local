/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import axios from 'axios';
import ExcelJS from 'exceljs';
import { Modal, ScrollArea, Text } from '@mantine/core';
import { MantineReactTable } from 'mantine-react-table';
import React, { useEffect, useMemo, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { handleGetInfoPago, handleOnWaiting, handleProductoCantidad } from '../../../../../utils/functions';
import { Box, MultiSelect } from '@mantine/core';
import { List, ThemeIcon } from '@mantine/core';

import imgDetalle from '../../../../../utils/img/Otros/detalle2.png';
import { modals } from '@mantine/modals';
import './pendientes.scss';
import Detalle from '../Detalle/Detalle';
import { Notify } from '../../../../../utils/notify/notify';
import { simboloMoneda } from '../../../../../services/global';
import { socket } from '../../../../../utils/socket/connect';

const Pendientes = () => {
  const [rowSelection, setRowSelection] = useState([]);
  const [orderSelection, setOrderSelection] = useState([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [infoPendientes, setInfoPendientes] = useState([]);
  const [inWarehouse, setInWarehouse] = useState([]);
  const [key, setKey] = useState(0);

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [onModal, setOnModal] = useState('');
  const [onDetail, setOnDetail] = useState();

  const handleGetPendientes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-reporte-pendientes`);
      if (response) {
        const info = response.data;
        // setData(info);
        handleGetFactura(info);
      }
    } catch (error) {
      console.log(error);
      Notify('Error', 'No se obtener reporte de pendientes', 'fail');
    }
  };

  const handleAlmacenarPendientes = async (Ids) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/add-to-warehouse`, { Ids });

      return response.data;
    } catch (error) {
      console.log(error.response.data.mensaje);
      throw new Error(error);
    }
  };

  const handleChangeLocation_OrderService = async () => {
    try {
      const requests = orderSelection.map(async (o) => {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/update-location/${o._id}`, {
          location: 2,
        }); // "2" es Almacen
        const data = response.data;
        const { facturaActualizada, factura } = data;
        socket.emit('client:updateOrder', facturaActualizada);
        return factura;
      });

      const results = await Promise.all(requests);
      const updatedIds = results.map((result) => result._id);

      await handleAlmacenarPendientes(updatedIds)
        .then((res) => {
          // Notify('Almacenamiento Exitoso', '', 'success');
          const updatedInfoPendientes = infoPendientes.filter((p) => !updatedIds.includes(p._id));

          setInfoPendientes(updatedInfoPendientes);
          setInWarehouse(results);
          setRowSelection([]);
          setOrderSelection([]);
          setKey(key + 1);
          setOnModal('Almacenados');
          open();
        })
        .catch(() => {
          Notify('Error', 'No se pudo agregar al almacen', 'fail');
        });
    } catch (error) {
      Notify('Error', 'Actualizacion de ubicacion fallido', 'fail');
      console.log(error.response.data.mensaje);
    }
  };

  const handleGetFactura = (info) => {
    const reOrdenar = [...info].sort((a, b) => b.index - a.index);
    const newData = reOrdenar.map((d) => ({
      _id: d._id,
      Recibo: String(d.codRecibo).padStart(6, '0'),
      Nombre: d.Nombre,
      Modalidad: d.Modalidad,
      Producto: handleProductoCantidad(d.Producto),
      DetalleProducto: d.Producto,
      totalNeto: d.totalNeto,
      Celular: d.celular,
      Pago: d.Pago,
      ListPago: d.ListPago,
      FechaIngreso: d.dateRecepcion,
      FechaPrevista: d.datePrevista,
      Factura: d.factura,
      CargosExtras: d.cargosExtras,
      Descuento: d.descuento,
      onWaiting: handleOnWaiting(d.dateRecepcion.fecha, d.estadoPrenda, d.dateEntrega.fecha),
    }));

    setInfoPendientes(newData);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'Recibo',
        header: 'Codigo',
        mantineFilterTextInputProps: {
          placeholder: 'N°',
        },
        size: 75,
      },
      {
        accessorKey: 'Nombre',
        header: 'Nombre',
        mantineFilterTextInputProps: {
          placeholder: 'Cliente',
        },
        size: 150,
      },
      {
        accessorKey: 'Celular',
        header: 'Celular',
        mantineFilterTextInputProps: {
          placeholder: 'Numero',
        },
        size: 100,
      },
      {
        accessorKey: 'Pago',
        header: 'Pago',
        filterVariant: 'select',
        mantineFilterSelectProps: { data: ['Completo', 'Incompleto', 'Pendiente'] },
        mantineFilterTextInputProps: { placeholder: 'C / I / P' },
        editVariant: 'select',
        mantineEditSelectProps: {
          data: [
            {
              value: 'Completo',
              label: 'Completo',
            },
            {
              value: 'Incompleto',
              label: 'Incompleto',
            },
            {
              value: 'Pendiente',
              label: 'Pendiente',
            },
          ],
        },
        enableEditing: false,
        size: 125,
      },
      {
        accessorKey: 'Producto',
        header: 'Producto',
        mantineFilterTextInputProps: {
          placeholder: 'Producto',
        },
        Cell: ({ cell }) => (
          <MultiSelect
            data={cell.getValue()}
            value={cell.getValue()}
            disabled={true}
            clearable={true}
            searchable={false}
          />
        ),
        size: 180,
      },

      {
        accessorKey: 'FechaIngreso.fecha',
        header: 'Fecha Ingreso',
        mantineFilterTextInputProps: {
          placeholder: 'A-M-D',
        },
        size: 120,
      },
      {
        accessorKey: 'onWaiting',
        header: 'Orden en Espera...',
        enableColumnFilter: false,
        Cell: ({ cell }) =>
          // Wrapped the arrow function with parentheses
          cell.getValue().stado ? (
            <Box
              sx={(theme) => ({
                backgroundColor: cell.getValue().stadoEntrega
                  ? theme.colors.blue[9]
                  : cell.getValue().nDias < 20
                  ? theme.colors.green[9]
                  : cell.getValue().nDias >= 21 && cell.getValue().nDias <= 30
                  ? theme.colors.yellow[9]
                  : theme.colors.red[9],
                borderRadius: '4px',
                color: '#fff',
                textAlign: 'center',
                padding: '10px 15px',
              })}
            >
              {cell.getValue().showText}
            </Box>
          ) : (
            <span>-</span>
          ),
        size: 150,
      },
    ],
    []
  );

  const exportToExcel = async () => {
    const fileName = `Lista de Ordenes Pendientes`;

    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');

    // Estilos para el encabezado
    const headerStyle = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '333333' }, // Color de fondo para la cabecera (gris oscuro)
      },
      font: {
        color: { argb: 'FFFFFF' }, // Color del texto en la cabecera (blanco)
        bold: true, // Texto en negrita
      },
    };

    // Agregar la cabecera
    worksheet
      .addRow([
        'Orden',
        'Nombre',
        'Modalidad',
        'Monto Pagado',
        'Pago',
        'Total Neto',
        'Productos',
        'Celular',
        'En Espera',
        'Fecha de Ingreso',
      ])
      .eachCell((cell) => {
        cell.fill = headerStyle.fill;
        cell.font = headerStyle.font;
      });
    infoPendientes.forEach((item) => {
      //const quantitiesText = item.cantidad.join('\n');
      const productsText = Array.from(item.Producto).join('\n');
      const estadoPago = handleGetInfoPago(item.ListPago, item.totalNeto);

      worksheet.addRow([
        item.Recibo,
        item.Nombre,
        item.Modalidad,
        estadoPago.pago > 0 ? `${simboloMoneda} ${estadoPago.pago}` : '-',
        estadoPago.estado,
        item.totalNeto,
        productsText,
        item.Celular ? item.Celular : '-',
        item.onWaiting.showText,
        item.FechaIngreso.fecha,
      ]);
    });

    const productsColumn = worksheet.getColumn(7);

    worksheet.eachRow((row) => {
      row.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };
    });

    // Ajustar automáticamente el ancho de las columnas excepto "Products" basado en el contenido
    let maxLengthColumns = 0;
    await worksheet.columns.forEach((column) => {
      if (column !== productsColumn) {
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellLength = cell.value ? cell.value.toString().length : 10;
          maxLengthColumns = Math.max(maxLengthColumns, cellLength);
        });
        column.width = maxLengthColumns + 2; // Agrega un espacio adicional
      }
    });

    const maxLineLengths = [];
    await worksheet.eachRow({ includeEmpty: true }, (row) => {
      const cell = row.getCell(7); // Obtener la celda de la columna "Products"
      const lines = cell.text.split('\n');
      let maxLength = 0;
      lines.forEach((line) => {
        const lineLength = line.length;
        maxLength = Math.max(maxLength, lineLength);
      });
      maxLineLengths.push(maxLength);
    });

    const maxLength = Math.max(...maxLineLengths);
    productsColumn.width = maxLength + 4;

    // Aplicar autofiltro a todas las columnas y filas
    const totalRows = worksheet.rowCount;
    const totalColumns = worksheet.columnCount;

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: totalRows, column: totalColumns },
    };

    const HeaderProducts = worksheet.getCell('E1');

    productsColumn.alignment = {
      horizontal: 'left',
      vertical: 'middle',
      wrapText: true,
      indent: 1,
    };
    HeaderProducts.alignment = { horizontal: 'center', vertical: 'middle' };

    // Guardar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName + '.xlsx';
    a.click();

    URL.revokeObjectURL(url);
  };

  const openConfirmacion = async () => {
    modals.openConfirmModal({
      title: 'Registro de Factura',
      centered: true,
      children: (
        <Text size="sm">
          ¿Estás seguro de Almacenar{' '}
          {orderSelection.length === 1 ? 'la fila seleccionada' : `las ${orderSelection.length} filas seleccionadas`} ?
        </Text>
      ),
      labels: { confirm: 'Si', cancel: 'No' },
      confirmProps: { color: 'green' },
      //onCancel: () => console.log("cancelado"),
      onConfirm: () => handleChangeLocation_OrderService(),
    });
  };

  const handleExport = () => {
    if (!loading) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        exportToExcel();
      }, 2400);
    }
  };

  useEffect(() => {
    handleGetPendientes();
  }, []);

  return (
    <div className="c-pendiente">
      <h1>PENDIENTES</h1>
      <div className="t-list-p">
        <div className="actions">
          <button className={`button_wrapper ${loading ? 'loading' : ''} ${done ? 'done' : ''}`} onClick={handleExport}>
            <div className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.75"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />
              </svg>
            </div>
          </button>

          {orderSelection.length > 0 ? (
            <div className="wrap" type="button" onClick={openConfirmacion}>
              <button className="button">Almacenar</button>
            </div>
          ) : null}
        </div>
        {orderSelection.length > 0 ? (
          <span>
            Existe {orderSelection.length} fila{orderSelection.length > 1 ? 's' : null} selecciona
            {orderSelection.length > 1 ? 'das' : null}
          </span>
        ) : null}
        <MantineReactTable
          key={key}
          columns={columns}
          data={infoPendientes}
          initialState={{
            showColumnFilters: true,
            density: 'xs',
            pagination: { pageSize: 5 },
          }}
          filterFns={{
            customFilterFn: (row, id, filterValue) => {
              return row.getValue(id) === filterValue;
            },
          }}
          localization={{
            filterCustomFilterFn: 'Custom Filter Fn',
          }}
          enableColumnActions={false}
          enableSorting={false}
          enableTopToolbar={false}
          mantineTableProps={{
            highlightOnHover: false,
          }}
          positionToolbarAlertBanner={'none'}
          mantineTableBodyRowProps={({ row }) => ({
            onDoubleClick: (event) => {
              const isSelected = row.getIsSelected();
              if (isSelected) {
                const updatedSelection = orderSelection.filter((selectedRow) => selectedRow._id !== row.original._id);
                setOrderSelection(updatedSelection);
              } else {
                setOrderSelection([...orderSelection, row.original]);
              }
              setRowSelection((prev) => ({
                ...prev,
                [row.id]: !prev[row.id],
              }));
              row.getToggleSelectedHandler()(event);
            },
            selected: rowSelection[row.id],
            sx: {
              cursor: 'pointer',
            },
          })}
          enableRowActions={true}
          displayColumnDefOptions={{
            'mrt-row-actions': {
              size: 70,
              header: 'Detalle',
            },
          }}
          renderRowActions={({ row }) => (
            <img
              className="ico-detail"
              src={imgDetalle}
              alt="detalle"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setOnModal('Detalle');
                setOnDetail(row.original);
                open();
              }}
            />
          )}
          state={{
            rowSelection,
          }}
          enableStickyHeader={true}
          enableRowVirtualization={true}
        />
      </div>
      <Modal
        className="header-active"
        opened={opened}
        onClose={() => {
          close();
          setOnDetail();
          setOnModal('');
        }}
        size={550}
        scrollAreaComponent={ScrollArea.Autosize}
        title={
          onModal === 'Almacenados'
            ? 'Ordenes Almacenadas correctamente'
            : `Detalle de Pedido - ${onDetail?.Nombre.toUpperCase()} (codigo : ${onDetail?.Recibo})`
        }
        centered
      >
        {onModal === 'Almacenados' ? (
          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="teal" size={24} radius="xl">
                <i className="far fa-check-circle"></i>
              </ThemeIcon>
            }
          >
            {inWarehouse.map((a) => (
              <List.Item key={a._id}>
                Orden de Servicio N° {a.codRecibo} | {`"${a.Nombre.toUpperCase()}"`}
              </List.Item>
            ))}
          </List>
        ) : (
          <Detalle infoD={onDetail} />
        )}
      </Modal>
    </div>
  );
};

export default Pendientes;
