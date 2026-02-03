/* ----------------------------------------------------------------------------
 * Easy!Appointments - Online Appointment Scheduler
 *
 * @package     EasyAppointments
 * @author      A.Tselegidis <alextselegidis@gmail.com>
 * @copyright   Copyright (c) Alex Tselegidis
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://easyappointments.org
 * @since       v1.5.0
 * ---------------------------------------------------------------------------- */

/**
 * Calendar Readonly View Utility
 *
 * This module implements the functionality of the readonly calendar view.
 * Events can only be viewed, not edited or moved.
 */
App.Utils.CalendarReadonlyView = (function () {
    const $calendarPage = $('#calendar-readonly-page');
    const $reloadAppointments = $('#reload-appointments');
    const $calendar = $('#calendar');
    const $selectFilterItem = $('#select-filter-item');

    const FILTER_TYPE_ALL = 'all';
    const moment = window.moment;

    let $popoverTarget;
    let fullCalendar = null;

    /**
     * Add the utility event listeners.
     */
    function addEventListeners() {
        /**
         * Event: Reload Button "Click"
         */
        $reloadAppointments.on('click', () => {
            const calendarView = fullCalendar.view;

            if ($popoverTarget) {
                $popoverTarget.popover('dispose');
            }

            refreshCalendarAppointments(
                calendarView.activeStart,
                calendarView.activeEnd,
            );
        });

        /**
         * Event: Popover Close Button "Click"
         */
        $calendarPage.on('click', '.close-popover', () => {
            if ($popoverTarget) {
                $popoverTarget.popover('dispose');
            }
        });

        /**
         * Event: Select Filter Item "Change"
         */
        $selectFilterItem.on('change', () => {
            if ($popoverTarget) {
                $popoverTarget.popover('dispose');
            }

            const calendarView = fullCalendar.view;

            refreshCalendarAppointments(
                calendarView.activeStart,
                calendarView.activeEnd,
            );
        });
    }

    /**
     * Get the filter type based on the selected option.
     *
     * @return {String}
     */
    function getFilterType() {
        const $selectedOption = $selectFilterItem.find('option:selected');
        return $selectedOption.attr('type') || FILTER_TYPE_ALL;
    }

    /**
     * Get the selected record ID.
     *
     * @return {String}
     */
    function getRecordId() {
        const value = $selectFilterItem.val();
        return value !== FILTER_TYPE_ALL ? value : '';
    }

    /**
     * Refresh the calendar appointments.
     *
     * @param {Date} startDate
     * @param {Date} endDate
     */
    function refreshCalendarAppointments(startDate, endDate) {
        const formattedStartDate = moment(startDate).format('YYYY-MM-DD HH:mm:ss');
        const formattedEndDate = moment(endDate).format('YYYY-MM-DD HH:mm:ss');

        const filterType = getFilterType();
        const recordId = getRecordId();

        $.ajax({
            url: App.Utils.Url.siteUrl('calendar_readonly/get_calendar_appointments'),
            type: 'GET',
            data: {
                start_date: formattedStartDate,
                end_date: formattedEndDate,
                filter_type: filterType,
                record_id: recordId,
            },
            dataType: 'json',
        })
            .done((response) => {
                // Remove all events
                fullCalendar.removeAllEvents();

                // Add appointments to calendar
                response.forEach((appointment) => {
                    const event = {
                        id: appointment.id,
                        title: appointment.service?.name || 'Cita',
                        start: appointment.start_datetime,
                        end: appointment.end_datetime,
                        allDay: false,
                        backgroundColor: appointment.color || '#7cbae8',
                        borderColor: appointment.color || '#7cbae8',
                        extendedProps: {
                            data: appointment,
                        },
                    };

                    fullCalendar.addEvent(event);
                });
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.error('Error loading appointments:', errorThrown);
            });
    }

    /**
     * Create and display the event popover (readonly).
     *
     * @param {Object} info
     */
    function displayEventPopover(info) {
        if ($popoverTarget) {
            $popoverTarget.popover('dispose');
        }

        const appointment = info.event.extendedProps.data;
        const $target = $(info.el);
        $popoverTarget = $target;

        const startMoment = moment(appointment.start_datetime);
        const endMoment = moment(appointment.end_datetime);

        let html = `
            <div class="calendar-readonly-popover-content">
                <div class="appointment-info">
                    <p><strong><i class="fas fa-clock me-2"></i>Hora:</strong><br>
                    ${startMoment.format('HH:mm')} - ${endMoment.format('HH:mm')}</p>
                    
                    <p><strong><i class="fas fa-calendar me-2"></i>Fecha:</strong><br>
                    ${startMoment.format('DD/MM/YYYY')}</p>
        `;

        if (appointment.service) {
            html += `
                    <p><strong><i class="fas fa-business-time me-2"></i>Servicio:</strong><br>
                    ${App.Utils.String.escapeHtml(appointment.service.name)}</p>
            `;
        }

        if (appointment.provider) {
            const providerName = `${appointment.provider.first_name || ''} ${appointment.provider.last_name || ''}`.trim();
            if (providerName) {
                html += `
                    <p><strong><i class="fas fa-user-md me-2"></i>Proveedor:</strong><br>
                    ${App.Utils.String.escapeHtml(providerName)}</p>
                `;
            }
        }

        if (appointment.customer) {
            const customerName = `${appointment.customer.first_name || ''} ${appointment.customer.last_name || ''}`.trim();
            if (customerName) {
                html += `
                    <p><strong><i class="fas fa-user me-2"></i>Cliente:</strong><br>
                    ${App.Utils.String.escapeHtml(customerName)}</p>
                `;
            }
        }

        if (appointment.status) {
            html += `
                    <p><strong><i class="fas fa-info-circle me-2"></i>Estado:</strong><br>
                    ${App.Utils.String.escapeHtml(appointment.status)}</p>
            `;
        }

        if (appointment.notes) {
            html += `
                    <p><strong><i class="fas fa-sticky-note me-2"></i>Notas:</strong><br>
                    ${App.Utils.String.escapeHtml(appointment.notes)}</p>
            `;
        }

        html += `
                </div>
                <div class="d-flex justify-content-end mt-3">
                    <button class="btn btn-sm btn-secondary close-popover">
                        <i class="fas fa-times me-1"></i>Cerrar
                    </button>
                </div>
            </div>
        `;

        $target.popover({
            placement: 'top',
            title: `<strong>${App.Utils.String.escapeHtml(info.event.title)}</strong>`,
            content: html,
            html: true,
            container: 'body',
            trigger: 'manual',
            customClass: 'calendar-readonly-popover',
        });

        $target.popover('show');
    }

    /**
     * Calendar "View Render" Callback
     *
     * Whenever the calendar changes or refreshes its view certain actions need to be made.
     */
    function onDatesSet() {
        if (!fullCalendar || !fullCalendar.view) {
            return;
        }

        if ($popoverTarget) {
            $popoverTarget.popover('dispose');
        }

        refreshCalendarAppointments(
            fullCalendar.view.activeStart,
            fullCalendar.view.activeEnd,
        );
    }

    /**
     * Initialize the calendar.
     */
    function initializeCalendar() {
        const calendarElement = document.getElementById('calendar');

        if (!calendarElement) {
            console.error('Calendar element not found');
            return;
        }

        // Get first weekday setting
        const firstWeekday = vars('first_weekday');
        const firstWeekdayNumber = firstWeekday ? App.Utils.Date.getWeekdayId(firstWeekday) : 1;

        // Determine initial view
        const initialView = window.innerWidth < 468 ? 'timeGridDay' : 'dayGridMonth';

        fullCalendar = new FullCalendar.Calendar(calendarElement, {
            initialView: initialView,
            locale: vars('language_code') || 'es',
            nowIndicator: true,
            height: 'auto',
            firstDay: firstWeekdayNumber,
            slotDuration: '00:15:00',
            snapDuration: '00:15:00',
            scrollTime: '07:00:00',
            slotLabelInterval: '01:00',
            eventTextColor: '#333',
            eventColor: '#7cbae8',
            allDayContent: lang('all_day'),
            themeSystem: 'bootstrap5',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridDay,timeGridWeek,dayGridMonth',
            },
            buttonText: {
                today: lang('today'),
                day: lang('day'),
                week: lang('week'),
                month: lang('month'),
            },
            // Disable all editing capabilities
            editable: false,
            droppable: false,
            selectable: false,
            eventStartEditable: false,
            eventDurationEditable: false,
            eventClick: (info) => {
                displayEventPopover(info);
            },
            datesSet: onDatesSet,
        });

        fullCalendar.render();
    }

    /**
     * Initialize the filter select.
     */
    function initializeFilter() {
        // Add "All" option
        $selectFilterItem.append(
            $('<option>', {
                value: FILTER_TYPE_ALL,
                text: '-- Todos --',
                type: 'all',
            }),
        );

        // Add providers
        const providers = vars('available_providers') || [];
        if (providers.length > 0) {
            const $providerGroup = $('<optgroup>', { label: 'Proveedores' });
            providers.forEach((provider) => {
                $providerGroup.append(
                    $('<option>', {
                        value: provider.id,
                        text: `${provider.first_name} ${provider.last_name}`,
                        type: 'provider',
                    }),
                );
            });
            $selectFilterItem.append($providerGroup);
        }

        // Add services
        const services = vars('available_services') || [];
        if (services.length > 0) {
            const $serviceGroup = $('<optgroup>', { label: 'Servicios' });
            services.forEach((service) => {
                $serviceGroup.append(
                    $('<option>', {
                        value: service.id,
                        text: service.name,
                        type: 'service',
                    }),
                );
            });
            $selectFilterItem.append($serviceGroup);
        }
    }

    /**
     * Initialize the module.
     */
    function initialize() {
        initializeFilter();
        initializeCalendar();
        addEventListeners();
    }

    return {
        initialize,
        FILTER_TYPE_ALL,
    };
})();
