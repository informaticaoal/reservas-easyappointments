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
 * Booking page.
 *
 * This module implements the functionality of the booking page
 *
 * Old Name: FrontendBook
 */
App.Pages.Booking = (function () {
    const $selectDate = $('#select-date');
    const $selectService = $('#select-service');
    const $selectProvider = $('#select-provider');
    const $selectTimezone = $('#select-timezone');
    const $firstName = $('#first-name');
    const $lastName = $('#last-name');
    const $email = $('#email');
    const $phoneNumber = $('#phone-number');
    const $address = $('#address');
    const $city = $('#city');
    const $zipCode = $('#zip-code');
    const $notes = $('#notes');
    const $captchaTitle = $('.captcha-title');
    const $availableHours = $('#available-hours');
    const $bookAppointmentSubmit = $('#book-appointment-submit');
    const $deletePersonalInformation = $('#delete-personal-information');
    const $customField1 = $('#custom-field-1');
    const $customField2 = $('#custom-field-2');
    const $customField3 = $('#custom-field-3');
    const $customField4 = $('#custom-field-4');
    const $customField5 = $('#custom-field-5');
    const $displayBookingSelection = $('.display-booking-selection');
    const tippy = window.tippy;
    const moment = window.moment;

    /**
     * Determines the functionality of the page.
     *
     * @type {Boolean}
     */
    let manageMode = vars('manage_mode') || false;

    /**
     * Detect the month step.
     *
     * @param previousDateTimeMoment
     * @param nextDateTimeMoment
     *
     * @returns {Number}
     */
    function detectDatepickerMonthChangeStep(previousDateTimeMoment, nextDateTimeMoment) {
        return previousDateTimeMoment.isAfter(nextDateTimeMoment) ? -1 : 1;
    }

    /**
     * Update the minimum date for the date picker
     * 
     * @param {Date} minDate The new minimum date
     */
    function updateDatePickerMinDate(minDate) {
        // Access the flatpickr instance from the DOM element
        const flatpickrInstance = $selectDate[0]._flatpickr;
        if (flatpickrInstance) {
            flatpickrInstance.set('minDate', minDate);
        }
    }

    let currentDatePickerMode = 'single';
    let monthTimeout;
    let dayRangeStartDate = null; // Para almacenar la fecha de inicio del tramo

    /**
     * Initialize or reinitialize the date picker with a specific mode
     * @param {string} mode - 'single' or 'range'
     */
    function initializeDatePickerWithMode(mode) {
        // Destroy existing instance if it exists
        const existingInstance = $selectDate[0]._flatpickr;
        if (existingInstance) {
            existingInstance.destroy();
        }
        
        currentDatePickerMode = mode;
        dayRangeStartDate = null; // Reset the start date

        // Function to check if a date is a weekend (Saturday=6, Sunday=0)
        const isWeekend = (date) => {
            const day = date.getDay();
            return day === 0 || day === 6;
        };

        const flatpickrConfig = {
            inline: true,
            mode: mode,
            minDate: moment().add(1, 'day').set({hours: 0, minutes: 0, seconds: 0}).toDate(),
            maxDate: moment().add(vars('future_booking_limit'), 'days').toDate(),
            // Only disable weekends in 'single' mode (for hours and full-day)
            // In 'range' mode, weekends must be selectable so the range can span across them
            // (weekends will be excluded from the count, not from selection)
            disable: mode === 'single' ? [isWeekend] : [],
            onChange: (selectedDates, dateStr, instance) => {
                const appointmentType = $('#select-appointment-type').val();
                const serviceId = $selectService.val();
                const service = vars('available_services').find(
                    (availableService) => Number(availableService.id) === Number(serviceId),
                );
                
                const isDayRange = appointmentType === 'day-range' || (service && service.booking_type === 'days');
                const isDaysHours = appointmentType === 'days-hours';
                
                if (isDayRange) {
                    // Update the day range display
                    if (selectedDates.length >= 1) {
                        const startDate = moment(selectedDates[0]);
                        $('#day-range-start-display').text(startDate.format('DD/MM/YYYY'));
                        
                        if (selectedDates.length === 2) {
                            const endDate = moment(selectedDates[1]);
                            $('#day-range-end-display').text(endDate.format('DD/MM/YYYY'));
                            
                            // Calculate total WORKDAYS only (exclude weekends)
                            let workdays = 0;
                            let currentDay = startDate.clone();
                            while (currentDay.isSameOrBefore(endDate)) {
                                const dayOfWeek = currentDay.day();
                                // 0 = Sunday, 6 = Saturday
                                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                                    workdays++;
                                }
                                currentDay.add(1, 'day');
                            }
                            
                            $('#day-range-days-count').text(workdays);
                            $('#day-range-total').show();
                            
                            // Both dates selected - update confirm frame
                            App.Pages.Booking.updateConfirmFrame();
                        } else {
                            $('#day-range-end-display').text('-');
                            $('#day-range-total').hide();
                        }
                    } else {
                        $('#day-range-start-display').text('-');
                        $('#day-range-end-display').text('-');
                        $('#day-range-total').hide();
                    }
                } else if (isDaysHours && mode === 'range') {
                    // Handle range selection for days-hours (show progress even with 1 date)
                    updateSelectedDatesHours(selectedDates);
                    App.Pages.Booking.updateConfirmFrame();
                } else {
                    // For regular bookings: get available hours
                    if (selectedDates.length > 0) {
                        App.Http.Booking.getAvailableHours(moment(selectedDates[0]).format('YYYY-MM-DD'));
                    }
                    App.Pages.Booking.updateConfirmFrame();
                }
            },

            onMonthChange: (selectedDates, dateStr, instance) => {
                // In range mode, don't reload unavailable dates - it breaks the range selection
                // Weekends are already disabled via the isWeekend function
                const isRangeMode = instance.config.mode === 'range';
                
                if (isRangeMode) {
                    // Just restore opacity, don't reload dates
                    $selectDate.parent().fadeTo(400, 1);
                    return;
                }
                
                $selectDate.parent().fadeTo(400, 0.3); // Change opacity during loading

                if (monthTimeout) {
                    clearTimeout(monthTimeout);
                }

                monthTimeout = setTimeout(() => {
                    // Use displayed month instead of selected date for navigation
                    const displayedMonthMoment = moment(
                        instance.currentYearElement.value +
                            '-' +
                            String(Number(instance.monthsDropdownContainer.value) + 1).padStart(2, '0') +
                            '-01',
                    );

                    // For month change step calculation, use first day of previous displayed month if no selection
                    let previousMoment;
                    if (instance.selectedDates.length > 0) {
                        previousMoment = moment(instance.selectedDates[0]);
                    } else {
                        previousMoment = displayedMonthMoment.clone().subtract(1, 'month');
                    }

                    const monthChangeStep = detectDatepickerMonthChangeStep(previousMoment, displayedMonthMoment);

                    App.Http.Booking.getUnavailableDates(
                        $selectProvider.val(),
                        $selectService.val(),
                        displayedMonthMoment.format('YYYY-MM-DD'),
                        monthChangeStep,
                    );
                }, 500);
            },

            onYearChange: (selectedDates, dateStr, instance) => {
                // In range mode, don't reload unavailable dates
                const isRangeMode = instance.config.mode === 'range';
                
                if (isRangeMode) {
                    $selectDate.parent().fadeTo(400, 1);
                    return;
                }
                
                setTimeout(() => {
                    const displayedMonthMoment = moment(
                        instance.currentYearElement.value +
                            '-' +
                            String(Number(instance.monthsDropdownContainer.value) + 1).padStart(2, '0') +
                            '-01',
                    );

                    let previousMoment;
                    if (instance.selectedDates.length > 0) {
                        previousMoment = moment(instance.selectedDates[0]);
                    } else {
                        previousMoment = displayedMonthMoment.clone().subtract(1, 'year');
                    }

                    const monthChangeStep = detectDatepickerMonthChangeStep(previousMoment, displayedMonthMoment);

                    App.Http.Booking.getUnavailableDates(
                        $selectProvider.val(),
                        $selectService.val(),
                        displayedMonthMoment.format('YYYY-MM-DD'),
                        monthChangeStep,
                    );
                }, 500);
            },
        };

        // Create the flatpickr instance directly for better control
        $selectDate[0]._flatpickr = flatpickr($selectDate[0], flatpickrConfig);
    }

    /**
     * Initialize the module.
     */
    function initialize() {
        if (Boolean(Number(vars('display_cookie_notice'))) && window?.cookieconsent) {
            cookieconsent.initialise({
                palette: {
                    popup: {
                        background: '#ffffffbd',
                        text: '#666666',
                    },
                    button: {
                        background: '#429a82',
                        text: '#ffffff',
                    },
                },
                content: {
                    message: lang('website_using_cookies_to_ensure_best_experience'),
                    dismiss: 'OK',
                },
            });

            const $cookieNoticeLink = $('.cc-link');

            $cookieNoticeLink.replaceWith(
                $('<a/>', {
                    'data-bs-toggle': 'modal',
                    'data-bs-target': '#cookie-notice-modal',
                    'href': '#',
                    'class': 'cc-link',
                    'text': $cookieNoticeLink.text(),
                }),
            );
        }

        manageMode = vars('manage_mode');

        // Initialize page's components (tooltips, date pickers etc).
        tippy('[data-tippy-content]');
        
        // Initialize the date picker with single mode by default
        initializeDatePickerWithMode('single');

        App.Utils.UI.setDateTimePickerValue($selectDate, new Date());

        // Establecer siempre Europe/Madrid como zona horaria por defecto (entorno local)
        const defaultTimezone = 'Europe/Madrid';
        const isTimezoneSupported = $selectTimezone.find(`option[value="${defaultTimezone}"]`).length > 0;
        $selectTimezone.val(isTimezoneSupported ? defaultTimezone : 'UTC');

        // Bind the event handlers (might not be necessary every time we use this class).
        addEventListeners();

        optimizeContactInfoDisplay();

        const serviceOptionCount = $selectService.find('option').length;

        if (serviceOptionCount === 2) {
            $selectService.find('option[value=""]').remove();
            const firstServiceId = $selectService.find('option:first').attr('value');
            $selectService.val(firstServiceId).trigger('change');
        }

        // If the manage mode is true, the appointment data should be loaded by default.
        if (manageMode) {
            applyAppointmentData(vars('appointment_data'), vars('provider_data'), vars('customer_data'));

            $('#wizard-frame-1')
                .css({
                    'visibility': 'visible',
                    'display': 'none',
                })
                .fadeIn();
        } else {
            // Si hay datos de cliente (usuario logueado), autocompletar los campos
            const customerData = vars('customer_data');
            if (customerData) {
                applyCustomerData(customerData);
            }
            
            // Check if a specific service was selected (via URL parameter).
            const selectedServiceId = App.Utils.Url.queryParam('service');

            if (selectedServiceId && $selectService.find('option[value="' + selectedServiceId + '"]').length > 0) {
                $selectService.val(selectedServiceId);
            }

            $selectService.trigger('change'); // Load the available hours.

            // Check if a specific provider was selected.
            const selectedProviderId = App.Utils.Url.queryParam('provider');

            if (selectedProviderId && $selectProvider.find('option[value="' + selectedProviderId + '"]').length === 0) {
                // Select a service of this provider in order to make the provider available in the select box.
                for (const index in vars('available_providers')) {
                    const provider = vars('available_providers')[index];

                    if (Number(provider.id) === Number(selectedProviderId) && provider.services.length > 0) {
                        $selectService.val(provider.services[0]).trigger('change');
                    }
                }
            }

            if (selectedProviderId && $selectProvider.find('option[value="' + selectedProviderId + '"]').length > 0) {
                $selectProvider.val(selectedProviderId).trigger('change');
            }

            if (
                (selectedServiceId && selectedProviderId) ||
                (vars('available_services').length === 1 && vars('available_providers').length === 1)
            ) {
                if (!selectedServiceId) {
                    $selectService.val(vars('available_services')[0].id).trigger('change');
                }

                if (!selectedProviderId) {
                    $selectProvider.val(vars('available_providers')[0].id).trigger('change');
                }

                $('.active-step').removeClass('active-step');
                $('#step-2').addClass('active-step');
                $('#wizard-frame-1').hide();
                $('#wizard-frame-2').fadeIn();

                $selectService.closest('.wizard-frame').find('.button-next').trigger('click');

                $(document).find('.book-step:first').hide();

                $(document).find('.button-back:first').css('visibility', 'hidden');

                $(document)
                    .find('.book-step:not(:first)')
                    .each((index, bookStepEl) =>
                        $(bookStepEl)
                            .find('strong')
                            .text(index + 1),
                    );
            } else {
                $('#wizard-frame-1')
                    .css({
                        'visibility': 'visible',
                        'display': 'none',
                    })
                    .fadeIn();
            }

            prefillFromQueryParam('#first-name', 'first_name');
            prefillFromQueryParam('#last-name', 'last_name');
            prefillFromQueryParam('#email', 'email');
            prefillFromQueryParam('#phone-number', 'phone');
            prefillFromQueryParam('#address', 'address');
            prefillFromQueryParam('#city', 'city');
            prefillFromQueryParam('#zip-code', 'zip');
        }
    }

    function prefillFromQueryParam(field, param) {
        const $target = $(field);

        if (!$target.length) {
            return;
        }

        $target.val(App.Utils.Url.queryParam(param));
    }

    /**
     * Remove empty columns and center elements if needed.
     */
    function optimizeContactInfoDisplay() {
        // If a column has only one control shown then move the control to the other column.

        const $firstCol = $('#wizard-frame-3 .field-col:first');
        const $firstColControls = $firstCol.find('.form-control');
        const $secondCol = $('#wizard-frame-3 .field-col:last');
        const $secondColControls = $secondCol.find('.form-control');

        if ($firstColControls.length === 1 && $secondColControls.length > 1) {
            $firstColControls.each((index, controlEl) => {
                $(controlEl).parent().insertBefore($secondColControls.first().parent());
            });
        }

        if ($secondColControls.length === 1 && $firstColControls.length > 1) {
            $secondColControls.each((index, controlEl) => {
                $(controlEl).parent().insertAfter($firstColControls.last().parent());
            });
        }

        // Hide columns that do not have any controls displayed.

        const $fieldCols = $(document).find('#wizard-frame-3 .field-col');

        $fieldCols.each((index, fieldColEl) => {
            const $fieldCol = $(fieldColEl);

            if (!$fieldCol.find('.form-control').length) {
                $fieldCol.hide();
            }
        });
    }

    /**
     * Check for existing bookings and disable those dates when in full-day mode.
     * Automatically advances to the next available date if current date has bookings.
     * Prevents users from booking full day when ANY user has appointments on that date.
     */
    function checkAndDisableBookedDates() {
        const serviceId = $selectService.val();
        
        if (!serviceId) {
            return;
        }

        // Get dates where ANY user already has this service booked
        App.Http.Booking.getCustomerServiceDates(serviceId)
            .done((bookedDates) => {
                // Get current flatpickr instance
                const flatpickrInstance = $selectDate[0]._flatpickr;
                if (!flatpickrInstance) {
                    return;
                }

                // Check if we're in range mode - don't disable weekends in range mode
                const isRangeMode = flatpickrInstance.config.mode === 'range';

                // Function to check if a date is a weekend (only for full-day mode, not range)
                const isWeekend = (date) => {
                    const day = date.getDay();
                    return day === 0 || day === 6;
                };

                // Get currently selected date
                const currentSelectedDate = App.Utils.UI.getDateTimePickerValue($selectDate);
                const currentSelectedDateStr = currentSelectedDate 
                    ? moment(currentSelectedDate).format('YYYY-MM-DD') 
                    : null;

                // Disable the booked dates in the date picker (for full-day mode)
                const disabledDates = (bookedDates || []).map(date => new Date(date + 'T00:00'));
                
                // Get existing disabled dates from unavailability (filter out functions to avoid duplicates)
                const existingDisabled = (flatpickrInstance.config.disable || []).filter(d => d instanceof Date);
                
                // In range mode: only disable booked dates (weekends must be selectable)
                // In single mode: disable weekends + booked dates
                const allDisabled = isRangeMode 
                    ? [...existingDisabled, ...disabledDates]
                    : [isWeekend, ...existingDisabled, ...disabledDates];
                flatpickrInstance.set('disable', allDisabled);

                // Only auto-advance date in single mode (full-day), not in range mode
                if (!isRangeMode) {
                    // If the currently selected date has bookings or is a weekend, find next available date
                    const currentDayOfWeek = currentSelectedDate ? currentSelectedDate.getDay() : null;
                    const isCurrentDateWeekend = currentDayOfWeek === 0 || currentDayOfWeek === 6;
                    const isCurrentDateBooked = currentSelectedDateStr && bookedDates && bookedDates.includes(currentSelectedDateStr);
                    
                    if (isCurrentDateWeekend || isCurrentDateBooked) {
                        let nextDate = moment(currentSelectedDate || new Date()).add(1, 'day');
                        const maxDate = moment().add(vars('future_booking_limit'), 'days');
                        
                        // Find the next date that is not booked, not unavailable, and not a weekend
                        while (nextDate.isSameOrBefore(maxDate)) {
                            const nextDateStr = nextDate.format('YYYY-MM-DD');
                            const nextDateObj = nextDate.toDate();
                            
                            // Check if this date is available (not booked, not disabled, not weekend)
                            const isBooked = bookedDates && bookedDates.includes(nextDateStr);
                            const isWeekendDay = nextDateObj.getDay() === 0 || nextDateObj.getDay() === 6;
                            const isDisabledDate = existingDisabled.some(disabledDate => {
                                if (disabledDate instanceof Date) {
                                    return moment(disabledDate).format('YYYY-MM-DD') === nextDateStr;
                                }
                                return false;
                            });
                            
                            if (!isBooked && !isDisabledDate && !isWeekendDay) {
                                // Found an available date
                                App.Utils.UI.setDateTimePickerValue($selectDate, nextDate.toDate());
                                App.Http.Booking.getAvailableHours(nextDateStr);
                                break;
                            }
                            
                            nextDate.add(1, 'day');
                        }
                    }
                }
            })
            .fail(() => {
                console.error('Failed to get service booked dates');
            });
    }

    /**
     * Add the page event listeners.
     */
    function addEventListeners() {
        /**
         * Event: Appointment Type "Changed"
         * 
         * Toggle visibility of hours selector based on appointment type selection
         * and check for existing bookings when switching to full-day
         */
        const $selectAppointmentType = $('#select-appointment-type');
        const $hoursContainer = $('#hours-container');
        
        $selectAppointmentType.on('change', function() {
            const appointmentType = $(this).val();
            
            if (appointmentType === 'hours') {
                $hoursContainer.show();
                $('#day-range-container').hide();
                
                // Reinitialize date picker in single mode
                initializeDatePickerWithMode('single');
                
                // Re-enable all dates (remove custom disabled dates from full-day mode)
                App.Http.Booking.applyPreviousUnavailableDates();
                
                // Get available hours for the selected date
                const selectedDate = App.Utils.UI.getDateTimePickerValue($selectDate);
                if (selectedDate) {
                    App.Http.Booking.getAvailableHours(moment(selectedDate).format('YYYY-MM-DD'));
                }
            } else if (appointmentType === 'full-day') {
                $hoursContainer.hide();
                $('#day-range-container').hide();
                // Clear selected hour when switching to full-day
                $availableHours.find('.selected-hour').removeClass('selected-hour');
                
                // Reinitialize date picker in single mode
                initializeDatePickerWithMode('single');
                
                // Check for existing bookings and disable those dates
                checkAndDisableBookedDates();
            } else if (appointmentType === 'day-range') {
                $hoursContainer.hide();
                $('#day-range-container').show();
                // Clear selected hour when switching to day-range
                $availableHours.find('.selected-hour').removeClass('selected-hour');
                
                // Reset the day range display
                $('#day-range-start-display').text('-');
                $('#day-range-end-display').text('-');
                $('#day-range-total').hide();
                
                // Reinitialize date picker in RANGE mode for selecting start and end dates
                initializeDatePickerWithMode('range');
                
                // Check for existing bookings and disable those dates
                checkAndDisableBookedDates();
            } else if (appointmentType === 'days-hours') {
                $hoursContainer.hide();
                $('#day-range-container').hide();
                $('#days-hours-container').show();
                // Clear selected hour when switching to days-hours
                $availableHours.find('.selected-hour').removeClass('selected-hour');
                
                // Reinitialize date picker in RANGE mode for selecting start and end dates
                initializeDatePickerWithMode('range');
                
                // Check for existing bookings and disable those dates
                checkAndDisableBookedDates();
            }
            
            App.Pages.Booking.updateConfirmFrame();
        });
        
        // Initialize visibility on page load
        if ($selectAppointmentType.val() === 'hours') {
            $hoursContainer.show();
            $('#day-range-container').hide();
            $('#days-hours-container').hide();
        } else if ($selectAppointmentType.val() === 'day-range') {
            $hoursContainer.hide();
            $('#day-range-container').show();
            $('#days-hours-container').hide();
        } else if ($selectAppointmentType.val() === 'days-hours') {
            $hoursContainer.hide();
            $('#day-range-container').hide();
            $('#days-hours-container').show();
        } else {
            $hoursContainer.hide();
            $('#day-range-container').hide();
            $('#days-hours-container').hide();
        }

        /**
         * Event: Timezone "Changed"
         */
        $selectTimezone.on('change', () => {
            const date = App.Utils.UI.getDateTimePickerValue($selectDate);

            if (!date) {
                return;
            }

            App.Http.Booking.getAvailableHours(moment(date).format('YYYY-MM-DD'));

            App.Pages.Booking.updateConfirmFrame();
        });

        /**
         * Event: Customer form fields "Changed"
         * 
         * Update customer details in the confirmation frame when fields change
         */
        const customerFields = [$firstName, $lastName, $email, $phoneNumber, $address, $city, $zipCode];
        customerFields.forEach(($field) => {
            $field.on('input change', () => {
                updateCustomerDetails();
            });
        });

        /**
         * Event: Selected Provider "Changed"
         *
         * Whenever the provider changes the available appointment date - time periods must be updated.
         */
        $selectProvider.on('change', (event) => {
            const $target = $(event.target);

            const todayDateTimeObject = new Date();
            const todayDateTimeMoment = moment(todayDateTimeObject);

            App.Utils.UI.setDateTimePickerValue($selectDate, todayDateTimeObject);

            App.Http.Booking.getUnavailableDates(
                $target.val(),
                $selectService.val(),
                todayDateTimeMoment.format('YYYY-MM-DD'),
            );

            App.Pages.Booking.updateConfirmFrame();
        });

        /**
         * Event: Selected Service "Changed"
         *
         * When the user clicks on a service, its available providers should
         * become visible.
         */
        $selectService.on('change', (event) => {
            const $target = $(event.target);
            const serviceId = $selectService.val();
            $selectProvider.parent().prop('hidden', !Boolean(serviceId));

            $selectProvider.empty();

            $selectProvider.append(new Option(lang('please_select'), ''));

            vars('available_providers').forEach((provider) => {
                // If the current provider is able to provide the selected service, add him to the list box.
                const canServeService =
                    provider.services.filter((providerServiceId) => Number(providerServiceId) === Number(serviceId))
                        .length > 0;

                if (canServeService) {
                    $selectProvider.append(new Option(provider.first_name + ' ' + provider.last_name, provider.id));
                }
            });

            const providerOptionCount = $selectProvider.find('option').length;

            // Remove the "Please Select" option, if there is only one provider available

            if (providerOptionCount === 2) {
                $selectProvider.find('option[value=""]').remove();
            }

            // Add the "Any Provider" entry

            if (providerOptionCount > 2 && Boolean(Number(vars('display_any_provider')))) {
                $(new Option(lang('any_provider'), 'any-provider')).insertAfter($selectProvider.find('option:first'));
            }

            // Check if the selected service uses day-range booking
            const service = vars('available_services').find(
                (availableService) => Number(availableService.id) === Number(serviceId),
            );
            
            if (service) {
                if (service.booking_type === 'days') {
                    // Service is configured for day-range: auto-select day-range and hide selector
                    $('#select-appointment-type').val('day-range');
                    $('#hours-container').hide();
                    $('#day-range-container').show();
                    $('#select-appointment-type').closest('.mb-3').hide();
                    
                    // Reset the day range display
                    $('#day-range-start-display').text('-');
                    $('#day-range-end-display').text('-');
                    $('#day-range-total').hide();
                    
                    // Reinitialize date picker in range mode
                    initializeDatePickerWithMode('range');
                } else {
                    // Show appointment type selector (Por Horas / Día entero / Por Tramo de Días)
                    const $appointmentTypeContainer = $('#select-appointment-type').closest('.mb-3');
                    $appointmentTypeContainer.show();
                    
                    // Get the current appointment type and update visibility
                    const appointmentType = $('#select-appointment-type').val() || 'hours';
                    
                    // If day-range was selected but service doesn't support it, reset to hours
                    if (appointmentType === 'day-range') {
                        $('#select-appointment-type').val('hours');
                        $('#hours-container').show();
                        $('#day-range-container').hide();
                        initializeDatePickerWithMode('single');
                    } else if (appointmentType === 'hours') {
                        $('#hours-container').show();
                        $('#day-range-container').hide();
                        if (currentDatePickerMode !== 'single') {
                            initializeDatePickerWithMode('single');
                        }
                    } else {
                        $('#hours-container').hide();
                        $('#day-range-container').hide();
                        if (currentDatePickerMode !== 'single') {
                            initializeDatePickerWithMode('single');
                        }
                    }
                }
            }

            App.Http.Booking.getUnavailableDates(
                $selectProvider.val(),
                $target.val(),
                moment(App.Utils.UI.getDateTimePickerValue($selectDate)).format('YYYY-MM-DD'),
            );

            // If in full-day mode, check and disable dates with existing bookings
            const appointmentType = $('#select-appointment-type').val();
            if (appointmentType !== 'hours') {
                checkAndDisableBookedDates();
            }

            App.Pages.Booking.updateConfirmFrame();

            App.Pages.Booking.updateServiceDescription(serviceId);
            
            // Show/hide floor plans section based on service selection
            const $floorPlansSection = $('#floor-plans-section');
            const $selectedOption = $selectService.find('option:selected');
            const serviceGroup = $selectedOption.data('group');
            const serviceName = $selectedOption.data('service-name');
            
            // Hide all floor plan items first
            $('.floor-plan-item').hide();
            
            if (serviceId && serviceName) {
                // Find the floor plan item that matches the service name
                const $matchingFloorPlan = $(`.floor-plan-item[data-service="${serviceName}"]`);
                
                if ($matchingFloorPlan.length > 0) {
                    // Show the matching floor plan
                    $matchingFloorPlan.fadeIn(300);
                    
                    // Update the title
                    if (serviceGroup) {
                        $('#floor-plan-title').text(`Ubicación: ${serviceName} (${serviceGroup})`);
                    } else {
                        $('#floor-plan-title').text(`Ubicación: ${serviceName}`);
                    }
                    
                    // Show the section with animation
                    $floorPlansSection.slideDown(300);
                } else {
                    // No floor plan available for this service
                    $floorPlansSection.slideUp(300);
                }
            } else {
                // No service selected
                $floorPlansSection.slideUp(300);
            }
        });

        /**
         * Event: Next Step Button "Clicked"
         *
         * This handler is triggered every time the user pressed the "next" button on the book wizard.
         * Some special tasks might be performed, depending on the current wizard step.
         */
        $('.button-next').on('click', (event) => {
            const $target = $(event.currentTarget);

            // If we are on the first step and there is no provider selected do not continue with the next step.
            if ($target.attr('data-step_index') === '1' && !$selectProvider.val()) {
                return;
            }

            // If we are on the 2nd tab then the user should have an appointment hour selected (only if 'hours' is selected).
            if ($target.attr('data-step_index') === '2') {
                const serviceId = $selectService.val();
                const service = vars('available_services').find(
                    (availableService) => Number(availableService.id) === Number(serviceId),
                );
                
                const isDayRangeBooking = service && service.booking_type === 'days';
                
                if (isDayRangeBooking) {
                    // For day-range bookings, check if both dates are selected
                    const flatpickrInstance = $selectDate[0]._flatpickr;
                    if (!flatpickrInstance || !flatpickrInstance.selectedDates || flatpickrInstance.selectedDates.length !== 2) {
                        if (!$('#select-date-range-prompt').length) {
                            $('<div/>', {
                                'id': 'select-date-range-prompt',
                                'class': 'text-danger mb-4',
                                'text': 'Por favor, selecciona una fecha de inicio y una fecha de fin.',
                            }).prependTo('#select-date');
                        }
                        return;
                    }
                } else {
                    const appointmentType = $('#select-appointment-type').val();
                    
                    if (appointmentType === 'hours' && !$('.selected-hour').length) {
                        if (!$('#select-hour-prompt').length) {
                            $('<div/>', {
                                'id': 'select-hour-prompt',
                                'class': 'text-danger mb-4',
                                'text': lang('appointment_hour_missing'),
                            }).prependTo('#available-hours');
                        }
                        return;
                    }
                }
            }

            // If we are on the 3rd tab then we will need to validate the user's input before proceeding to the next
            // step.
            if ($target.attr('data-step_index') === '3') {
                if (!App.Pages.Booking.validateCustomerForm()) {
                    return; // Validation failed, do not continue.
                } else {
                    App.Pages.Booking.updateConfirmFrame();
                }
            }

            // Display the next step tab (uses jquery animation effect).
            const nextTabIndex = parseInt($target.attr('data-step_index')) + 1;

            $target
                .parents()
                .eq(1)
                .fadeOut(() => {
                    $('.active-step').removeClass('active-step');
                    $('#step-' + nextTabIndex).addClass('active-step');
                    $('#wizard-frame-' + nextTabIndex).fadeIn();
                    
                    // Si vamos al paso 4 (confirmación), actualizar los detalles del cliente
                    if (nextTabIndex === 4) {
                        updateCustomerDetails();
                    }
                });

            // Scroll to the top of the page. On a small screen, especially on a mobile device, this is very useful.
            const scrollingElement = document.scrollingElement || document.body;
            if (window.innerHeight < scrollingElement.scrollHeight) {
                scrollingElement.scrollTop = 0;
            }
        });

        /**
         * Event: Back Step Button "Clicked"
         *
         * This handler is triggered every time the user pressed the "back" button on the
         * book wizard.
         */
        $('.button-back').on('click', (event) => {
            const prevTabIndex = parseInt($(event.currentTarget).attr('data-step_index')) - 1;

            $(event.currentTarget)
                .parents()
                .eq(1)
                .fadeOut(() => {
                    $('.active-step').removeClass('active-step');
                    $('#step-' + prevTabIndex).addClass('active-step');
                    $('#wizard-frame-' + prevTabIndex).fadeIn();
                });
        });

        /**
         * Event: Available Hour "Click"
         *
         * Triggered whenever the user clicks on an available hour for his appointment.
         * Allows multiple selection when in "Por horas" mode.
         */
        $availableHours.on('click', '.available-hour', (event) => {
            const $clickedHour = $(event.target);
            
            // Toggle selection for this hour
            if ($clickedHour.hasClass('selected-hour')) {
                $clickedHour.removeClass('selected-hour');
            } else {
                $clickedHour.addClass('selected-hour');
            }
            
            App.Pages.Booking.updateConfirmFrame();
        });

        if (manageMode) {
            /**
             * Event: Cancel Appointment Button "Click"
             *
             * When the user clicks the "Cancel" button this form is going to be submitted. We need
             * the user to confirm this action because once the appointment is cancelled, it will be
             * deleted from the database.
             *
             * @param {jQuery.Event} event
             */
            $('#cancel-appointment').on('click', () => {
                const $cancelAppointmentForm = $('#cancel-appointment-form');

                let $cancellationReason;

                const buttons = [
                    {
                        text: lang('close'),
                        click: (event, messageModal) => {
                            messageModal.hide();
                        },
                    },
                    {
                        text: lang('confirm'),
                        click: () => {
                            if ($cancellationReason.val() === '') {
                                $cancellationReason.css('border', '2px solid #DC3545');
                                return;
                            }
                            $cancelAppointmentForm.find('#hidden-cancellation-reason').val($cancellationReason.val());
                            $cancelAppointmentForm.submit();
                        },
                    },
                ];

                App.Utils.Message.show(
                    lang('cancel_appointment_title'),
                    lang('write_appointment_removal_reason'),
                    buttons,
                );

                $cancellationReason = $('<textarea/>', {
                    'class': 'form-control mt-2',
                    'id': 'cancellation-reason',
                    'rows': '3',
                    'css': {
                        'width': '100%',
                    },
                }).appendTo('#message-modal .modal-body');

                return false;
            });

            $deletePersonalInformation.on('click', () => {
                const buttons = [
                    {
                        text: lang('cancel'),
                        click: (event, messageModal) => {
                            messageModal.hide();
                        },
                    },
                    {
                        text: lang('delete'),
                        click: () => {
                            App.Http.Booking.deletePersonalInformation(vars('customer_token'));
                        },
                    },
                ];

                App.Utils.Message.show(
                    lang('delete_personal_information'),
                    lang('delete_personal_information_prompt'),
                    buttons,
                );
            });
        }

        /**
         * Event: Book Appointment Form "Submit"
         *
         * Before the form is submitted to the server we need to make sure that in the meantime the selected appointment
         * date/time wasn't reserved by another customer or event.
         *
         * @param {jQuery.Event} event
         */
        $bookAppointmentSubmit.on('click', () => {
            const $acceptToTermsAndConditions = $('#accept-to-terms-and-conditions');

            $acceptToTermsAndConditions.removeClass('is-invalid');

            if ($acceptToTermsAndConditions.length && !$acceptToTermsAndConditions.prop('checked')) {
                $acceptToTermsAndConditions.addClass('is-invalid');
                return;
            }

            const $acceptToPrivacyPolicy = $('#accept-to-privacy-policy');

            $acceptToPrivacyPolicy.removeClass('is-invalid');

            if ($acceptToPrivacyPolicy.length && !$acceptToPrivacyPolicy.prop('checked')) {
                $acceptToPrivacyPolicy.addClass('is-invalid');
                return;
            }

            App.Http.Booking.registerAppointment();
        });

        /**
         * Event: Refresh captcha image.
         */
        $captchaTitle.on('click', 'button', () => {
            $('.captcha-image').attr('src', App.Utils.Url.siteUrl('captcha?' + Date.now()));
        });

        $selectDate.on('mousedown', '.ui-datepicker-calendar td', () => {
            setTimeout(() => {
                App.Http.Booking.applyPreviousUnavailableDates();
            }, 300);
        });
    }

    /**
     * This function validates the customer's data input. The user cannot continue without passing all the validation
     * checks.
     *
     * @return {Boolean} Returns the validation result.
     */
    function validateCustomerForm() {
        $('#wizard-frame-3 .is-invalid').removeClass('is-invalid');
        $('#wizard-frame-3 label.text-danger').removeClass('text-danger');

        // Validate required fields.
        let missingRequiredField = false;

        $('.required').each((index, requiredField) => {
            if (!$(requiredField).val()) {
                $(requiredField).addClass('is-invalid');
                missingRequiredField = true;
            }
        });

        if (missingRequiredField) {
            $('#form-message').text(lang('fields_are_required'));
            return false;
        }

        // Validate email address.
        if ($email.val() && !App.Utils.Validation.email($email.val())) {
            $email.addClass('is-invalid');
            $('#form-message').text(lang('invalid_email'));
            return false;
        }

        // Validate phone number.
        const phoneNumber = $phoneNumber.val();

        if (phoneNumber && !App.Utils.Validation.phone(phoneNumber)) {
            $phoneNumber.addClass('is-invalid');
            $('#form-message').text(lang('invalid_phone'));
            return false;
        }

        return true;
    }

    /**
     * Updates the selected dates and hours display for days-hours mode
     */
    function updateSelectedDatesHours(selectedDates) {
        const $container = $('#selected-dates-hours');
        $container.empty();

        if (selectedDates.length === 0) {
            $container.append('<p class="text-muted">Selecciona la fecha de inicio del rango.</p>');
            return;
        }

        if (selectedDates.length === 1) {
            const startDate = moment(selectedDates[0]);
            $container.append(`
                <div class="alert alert-info mb-3">
                    <strong>Fecha de inicio seleccionada:</strong> ${startDate.format('DD/MM/YYYY')}<br>
                    <em>Ahora selecciona la fecha de fin del rango.</em>
                </div>
            `);
            return;
        }

        // selectedDates.length >= 2
        const startDate = moment(selectedDates[0]);
        const endDate = moment(selectedDates[1]);

        // Generate all workdays in the range (excluding weekends)
        const workdays = [];
        let currentDate = startDate.clone();
        while (currentDate.isSameOrBefore(endDate)) {
            const dayOfWeek = currentDate.day();
            // Skip weekends: 0 = Sunday, 6 = Saturday
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workdays.push(currentDate.format('YYYY-MM-DD'));
            }
            currentDate.add(1, 'day');
        }

        if (workdays.length === 0) {
            $container.append('<p class="text-muted">No hay días laborables en el rango seleccionado.</p>');
            return;
        }

        // Display selected date range and workdays
        const dateRangeText = `${startDate.format('DD/MM/YYYY')} - ${endDate.format('DD/MM/YYYY')}`;
        const workdaysText = workdays.map(date => moment(date).format('DD/MM')).join(', ');
        
        $container.append(`
            <div class="alert alert-info mb-3">
                <strong>Rango seleccionado:</strong> ${dateRangeText}<br>
                <strong>Días laborables (${workdays.length}):</strong> ${workdaysText}
            </div>
        `);

        // Single hours container for all workdays
        const $hoursSection = $(`
            <div class="hours-section mb-3">
                <h6 class="mb-3">
                    <i class="fas fa-clock text-primary me-2"></i>
                    Selecciona las horas para todos los días laborables:
                </h6>
                <div class="hours-container p-3 border rounded bg-light" id="all-dates-hours"></div>
            </div>
        `);

        $container.append($hoursSection);

        // Get available hours for the first workday (assuming same availability)
        App.Http.Booking.getAvailableHoursForDate(workdays[0], '#all-dates-hours');
    }

    /**
     * Every time this function is executed, it updates the confirmation page with the latest
     * customer settings and input for the appointment booking.
     */
    function updateConfirmFrame() {
        const serviceId = $selectService.val();
        const providerId = $selectProvider.val();
        const appointmentType = $('#select-appointment-type').val();

        $displayBookingSelection.text(`${lang('service')} │ ${lang('provider')}`); // Notice: "│" is a custom ASCII char

        const serviceOptionText = serviceId ? $selectService.find('option:selected').text() : lang('service');
        const providerOptionText = providerId ? $selectProvider.find('option:selected').text() : lang('provider');

        if (serviceId || providerId) {
            $displayBookingSelection.text(`${serviceOptionText} │ ${providerOptionText}`);
        }

        // Render the appointment details

        const service = vars('available_services').find(
            (availableService) => Number(availableService.id) === Number(serviceId),
        );

        if (!service) {
            return; // Service was not found
        }

        // Check if this is a day-range booking (either from service config or user selection)
        const isDayRangeBooking = service.booking_type === 'days' || appointmentType === 'day-range';
        
        if (isDayRangeBooking) {
            // For day-range bookings, check if both dates are selected
            const flatpickrInstance = $selectDate[0]._flatpickr;
            if (!flatpickrInstance || !flatpickrInstance.selectedDates || flatpickrInstance.selectedDates.length !== 2) {
                return; // Both dates not selected yet
            }
        } else {
            // For 'hours' type, require selected hour. For 'full-day' type, skip this check
            if (appointmentType === 'hours' && !$availableHours.find('.selected-hour').length) {
                return; // No time is selected, skip the rest of this function...
            }
        }

        const selectedDateObject = App.Utils.UI.getDateTimePickerValue($selectDate);
        const selectedDateMoment = moment(selectedDateObject);
        const selectedDate = selectedDateMoment.format('YYYY-MM-DD');
        
        // Get all selected hours
        let selectedTimesText = '';
        const $selectedHours = $availableHours.find('.selected-hour');
        
        if (appointmentType === 'hours' && $selectedHours.length > 0) {
            const times = [];
            $selectedHours.each(function() {
                times.push($(this).text());
            });
            selectedTimesText = times.join(', ');
        } else if (appointmentType === 'days-hours') {
            // Collect selected date range and times for days-hours
            const flatpickrInstance = $selectDate[0]._flatpickr;
            if (flatpickrInstance && flatpickrInstance.selectedDates.length >= 2) {
                const startDate = moment(flatpickrInstance.selectedDates[0]).format(vars('date_format'));
                const endDate = moment(flatpickrInstance.selectedDates[1]).format(vars('date_format'));
                const $selectedHours = $('#all-dates-hours .selected-hour');
                const times = [];
                $selectedHours.each(function() {
                    times.push($(this).text());
                });
                selectedTimesText = `Rango: ${startDate} - ${endDate} - Horas: ${times.join(', ')}`;
            } else if (flatpickrInstance && flatpickrInstance.selectedDates.length === 1) {
                const startDate = moment(flatpickrInstance.selectedDates[0]).format(vars('date_format'));
                selectedTimesText = `Fecha inicio: ${startDate} - Selecciona fecha fin`;
            } else {
                selectedTimesText = 'Selecciona fecha de inicio';
            }
        }

        let formattedSelectedDate = '';

        if (selectedDateObject) {
            if (isDayRangeBooking) {
                // Format date range for day-range bookings
                const flatpickrInstance = $selectDate[0]._flatpickr;
                const startDate = moment(flatpickrInstance.selectedDates[0]).format('YYYY-MM-DD');
                const endDate = moment(flatpickrInstance.selectedDates[1]).format('YYYY-MM-DD');
                const formattedStartDate = App.Utils.Date.format(startDate, vars('date_format'), vars('time_format'), false);
                const formattedEndDate = App.Utils.Date.format(endDate, vars('date_format'), vars('time_format'), false);
                formattedSelectedDate = `${formattedStartDate} - ${formattedEndDate} (Tramo de días)`;
            } else if (appointmentType === 'full-day') {
                formattedSelectedDate = App.Utils.Date.format(selectedDate, vars('date_format'), vars('time_format'), false) + ' (Día entero)';
            } else if (appointmentType === 'days-hours') {
                const flatpickrInstance = $selectDate[0]._flatpickr;
                if (flatpickrInstance && flatpickrInstance.selectedDates.length >= 2) {
                    const startDate = moment(flatpickrInstance.selectedDates[0]).format('YYYY-MM-DD');
                    const endDate = moment(flatpickrInstance.selectedDates[1]).format('YYYY-MM-DD');
                    formattedSelectedDate = `Rango: ${App.Utils.Date.format(startDate, vars('date_format'), vars('time_format'), false)} - ${App.Utils.Date.format(endDate, vars('date_format'), vars('time_format'), false)}`;
                } else if (flatpickrInstance && flatpickrInstance.selectedDates.length === 1) {
                    const startDate = moment(flatpickrInstance.selectedDates[0]).format('YYYY-MM-DD');
                    formattedSelectedDate = `Inicio: ${App.Utils.Date.format(startDate, vars('date_format'), vars('time_format'), false)} - Selecciona fin`;
                } else {
                    formattedSelectedDate = 'Selecciona rango de fechas';
                }
            } else {
                formattedSelectedDate =
                    App.Utils.Date.format(selectedDate, vars('date_format'), vars('time_format'), false) +
                    ' ' +
                    selectedTimesText;
            }
        }

        const timezoneOptionText = $selectTimezone.find('option:selected').text();

        $('#appointment-details').html(`
            <div>
                <div class="mb-2 fw-bold fs-3">
                    ${serviceOptionText}
                </div> 
                <div class="mb-2 fw-bold text-muted">
                    ${providerOptionText}
                </div>
                <div class="mb-2">
                    <i class="fas fa-calendar-day me-2"></i>
                    ${formattedSelectedDate}
                </div> 
                <div class="mb-2" style="display:none;">
                    <i class="fas fa-clock me-2"></i>
                    ${service.duration} ${lang('minutes')}
                </div>
                <div class="mb-2" style="display:none;">
                    <i class="fas fa-globe me-2"></i>
                    ${timezoneOptionText}
                </div> 
                <div class="mb-2" ${!Number(service.price) ? 'hidden' : ''}>
                    <i class="fas fa-cash-register me-2"></i>
                    ${Number(service.price).toFixed(2)} ${service.currency}
                </div>
            </div>     
        `);

        // Render the customer information

        const firstName = App.Utils.String.escapeHtml($firstName.val());
        const lastName = App.Utils.String.escapeHtml($lastName.val());
        const fullName = `${firstName} ${lastName}`.trim();
        const email = App.Utils.String.escapeHtml($email.val());
        const phoneNumber = App.Utils.String.escapeHtml($phoneNumber.val());
        const address = App.Utils.String.escapeHtml($address.val());
        const city = App.Utils.String.escapeHtml($city.val());
        const zipCode = App.Utils.String.escapeHtml($zipCode.val());

        const addressParts = [];

        if (city) {
            addressParts.push(city);
        }

        if (zipCode) {
            addressParts.push(zipCode);
        }

        $('#customer-details').html(`
            <div>
                <div class="mb-2 fw-bold fs-3">
                    ${lang('contact_info')}
                </div>
                <div class="mb-2 fw-bold text-muted" ${!fullName ? 'hidden' : ''}>
                    ${fullName}
                </div>
                <div class="mb-2" ${!email ? 'hidden' : ''}>
                    ${email}
                </div>
                <div class="mb-2" ${!phoneNumber ? 'hidden' : ''}>
                    ${phoneNumber}
                </div>
                <div class="mb-2" ${!address ? 'hidden' : ''}>
                    ${address}
                </div>
                <div class="mb-2" ${!addressParts.length ? 'hidden' : ''}>
                    ${addressParts.join(', ')}
                </div>
            </div>
        `);

        // Update appointment form data for submission to server when the user confirms the appointment.

        const data = {};

        data.customer = {
            last_name: $lastName.val(),
            first_name: $firstName.val(),
            email: $email.val(),
            phone_number: $phoneNumber.val(),
            address: $address.val(),
            city: $city.val(),
            zip_code: $zipCode.val(),
            timezone: $selectTimezone.val(),
            // custom_field_1 ya no se guarda en el cliente, se mueve a las notas de la cita
            custom_field_2: $customField2.val(),
            custom_field_3: $customField3.val(),
            custom_field_4: $customField4.val(),
            custom_field_5: $customField5.val(),
        };

        // Construir las notas de la cita combinando notes y artículos
        let appointmentNotes = $notes.val() || '';
        const articlesDataField = document.getElementById('articles-data');
        
        if (articlesDataField && articlesDataField.value) {
            try {
                const articlesData = JSON.parse(articlesDataField.value);
                if (articlesData && articlesData.length > 0) {
                    let articlesText = 'Artículos necesarios:\n';
                    articlesData.forEach(function(item) {
                        articlesText += '- ' + item.article + ': ' + item.quantity + 
                            (item.quantity === 1 ? ' unidad' : ' unidades') + '\n';
                    });
                    if (appointmentNotes) {
                        appointmentNotes += '\n\n';
                    }
                    appointmentNotes += articlesText;
                }
            } catch (e) {
                console.error('Error al parsear artículos:', e);
            }
        }

        if (isDayRangeBooking) {
            // For day-range bookings, create appointments spanning multiple days
            const flatpickrInstance = $selectDate[0]._flatpickr;
            const startDate = moment(flatpickrInstance.selectedDates[0]);
            const endDate = moment(flatpickrInstance.selectedDates[1]);
            
            const appointments = [];
            let currentDate = startDate.clone();
            
            // Create one appointment per WORKDAY in the range (exclude weekends)
            while (currentDate.isSameOrBefore(endDate)) {
                const dayOfWeek = currentDate.day();
                
                // Skip weekends: 0 = Sunday, 6 = Saturday
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    const startDatetime = currentDate.format('YYYY-MM-DD') + ' 00:00:00';
                    const endDatetime = currentDate.format('YYYY-MM-DD') + ' 23:59:59';
                    
                    appointments.push({
                        start_datetime: startDatetime,
                        end_datetime: endDatetime,
                        notes: appointmentNotes,
                        is_unavailability: false,
                        id_users_provider: $selectProvider.val(),
                        id_services: $selectService.val(),
                    });
                }
                
                currentDate.add(1, 'day');
            }
            
            // Store multiple appointments for day-range
            if (appointments.length > 1) {
                data.appointments = appointments;
            } else if (appointments.length === 1) {
                data.appointment = appointments[0];
            }
        } else if (appointmentType === 'full-day') {
            // For full-day appointments, create a single appointment
            const startDatetime = moment(App.Utils.UI.getDateTimePickerValue($selectDate)).format('YYYY-MM-DD') + ' 00:00:00';
            const endDatetime = moment(App.Utils.UI.getDateTimePickerValue($selectDate)).format('YYYY-MM-DD') + ' 23:59:59';
            
            data.appointment = {
                start_datetime: startDatetime,
                end_datetime: endDatetime,
                notes: appointmentNotes,
                is_unavailability: false,
                id_users_provider: $selectProvider.val(),
                id_services: $selectService.val(),
            };
        } else if (appointmentType === 'days-hours') {
            // For days-hours appointments, get workdays from range and create combinations with selected hours
            const appointments = [];
            
            // Get selected date range
            const flatpickrInstance = $selectDate[0]._flatpickr;
            if (!flatpickrInstance || flatpickrInstance.selectedDates.length < 2) {
                // Not enough dates selected
                return;
            }
            
            const startDate = moment(flatpickrInstance.selectedDates[0]);
            const endDate = moment(flatpickrInstance.selectedDates[1]);
            
            // Generate workdays in range
            const workdays = [];
            let currentDate = startDate.clone();
            while (currentDate.isSameOrBefore(endDate)) {
                const dayOfWeek = currentDate.day();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
                    workdays.push(currentDate.format('YYYY-MM-DD'));
                }
                currentDate.add(1, 'day');
            }
            
            // Get selected hours
            const $selectedHours = $('#all-dates-hours .selected-hour');
            if ($selectedHours.length === 0) {
                // No hours selected
                return;
            }
            
            // Find selected service duration
            const serviceId = $selectService.val();
            const service = vars('available_services').find(
                (availableService) => Number(availableService.id) === Number(serviceId),
            );
            const serviceDuration = parseInt(service.duration);
            
            // Create appointment for each workday × hour combination
            workdays.forEach(dateStr => {
                $selectedHours.each(function() {
                    const selectedHourValue = $(this).data('value'); // HH:mm
                    
                    const startDatetime = dateStr + ' ' + selectedHourValue + ':00';
                    const endMoment = moment(dateStr + ' ' + selectedHourValue).add({'minutes': serviceDuration});
                    const endDatetime = endMoment.format('YYYY-MM-DD HH:mm:ss');
                    
                    appointments.push({
                        start_datetime: startDatetime,
                        end_datetime: endDatetime,
                        notes: appointmentNotes,
                        is_unavailability: false,
                        id_users_provider: $selectProvider.val(),
                        id_services: $selectService.val(),
                    });
                });
            });
            
            // Store multiple appointments
            if (appointments.length > 1) {
                data.appointments = appointments;
            } else if (appointments.length === 1) {
                data.appointment = appointments[0];
            }
        } else {
            // For hourly appointments, handle multiple selections
            const $selectedHours = $availableHours.find('.selected-hour');
            const appointments = [];
            
            // Find selected service duration
            const serviceId = $selectService.val();
            const service = vars('available_services').find(
                (availableService) => Number(availableService.id) === Number(serviceId),
            );
            const serviceDuration = parseInt(service.duration);
            
            $selectedHours.each(function() {
                const selectedHourValue = $(this).data('value'); // HH:mm
                const selectedDate = moment(App.Utils.UI.getDateTimePickerValue($selectDate)).format('YYYY-MM-DD');
                
                const startDatetime = selectedDate + ' ' + selectedHourValue + ':00';
                const endMoment = moment(selectedDate + ' ' + selectedHourValue).add({'minutes': serviceDuration});
                const endDatetime = endMoment.format('YYYY-MM-DD HH:mm:ss');
                
                appointments.push({
                    start_datetime: startDatetime,
                    end_datetime: endDatetime,
                    notes: appointmentNotes,
                    is_unavailability: false,
                    id_users_provider: $selectProvider.val(),
                    id_services: $selectService.val(),
                });
            });
            
            // If multiple hours selected, store as array. Otherwise, single appointment
            if (appointments.length > 1) {
                data.appointments = appointments;
            } else if (appointments.length === 1) {
                data.appointment = appointments[0];
            }
        }

        data.manage_mode = Number(manageMode);

        if (manageMode) {
            data.appointment.id = vars('appointment_data').id;
            data.customer.id = vars('customer_data').id;
        }

        $('input[name="post_data"]').val(JSON.stringify(data));
    }

    /**
     * This method calculates the end datetime of the current appointment.
     *
     * End datetime is depending on the service and start datetime fields.
     *
     * @return {String} Returns the end datetime in string format.
     */
    function calculateEndDatetime() {
        // Find selected service duration.
        const serviceId = $selectService.val();

        const service = vars('available_services').find(
            (availableService) => Number(availableService.id) === Number(serviceId),
        );

        // Add the duration to the start datetime.
        const selectedDate = moment(App.Utils.UI.getDateTimePickerValue($selectDate)).format('YYYY-MM-DD');

        const selectedHour = $('.selected-hour').data('value'); // HH:mm

        const startMoment = moment(selectedDate + ' ' + selectedHour);

        let endMoment;

        if (service.duration && startMoment) {
            endMoment = startMoment.clone().add({'minutes': parseInt(service.duration)});
        } else {
            endMoment = moment();
        }

        return endMoment.format('YYYY-MM-DD HH:mm:ss');
    }

    /**
     * This method applies the appointment's data to the wizard so
     * that the user can start making changes on an existing record.
     *
     * @param {Object} appointment Selected appointment's data.
     * @param {Object} provider Selected provider's data.
     * @param {Object} customer Selected customer's data.
     *
     * @return {Boolean} Returns the operation result.
     */
    /**
     * Update only customer details in the confirmation frame.
     */
    function updateCustomerDetails() {
        // Obtener datos del usuario desde customer_data (usuario logueado)
        const customerData = vars('customer_data');
        
        let firstName = '';
        let lastName = '';
        
        // Priorizar los datos de la sesión del usuario logueado
        if (customerData && (customerData.first_name || customerData.last_name)) {
            firstName = customerData.first_name || '';
            lastName = customerData.last_name || '';
        } else {
            // Si no hay datos de sesión, usar los campos del formulario
            firstName = App.Utils.String.escapeHtml($firstName.val());
            lastName = App.Utils.String.escapeHtml($lastName.val());
        }
        
        const fullName = `${firstName} ${lastName}`.trim();
        const email = App.Utils.String.escapeHtml($email.val());
        const phoneNumber = App.Utils.String.escapeHtml($phoneNumber.val());
        const address = App.Utils.String.escapeHtml($address.val());
        const city = App.Utils.String.escapeHtml($city.val());
        const zipCode = App.Utils.String.escapeHtml($zipCode.val());

        const addressParts = [];

        if (city) {
            addressParts.push(city);
        }

        if (zipCode) {
            addressParts.push(zipCode);
        }

        // Siempre mostrar el título y el nombre si existe
        let customerDetailsHtml = `
            <div>
                <div class="mb-2 fw-bold fs-3">
                    ${lang('contact_info')}
                </div>`;
        
        // Siempre mostrar el nombre si existe, sin depender de la configuración
        if (fullName) {
            customerDetailsHtml += `
                <div class="mb-2 fw-bold text-muted">
                    ${fullName}
                </div>`;
        }
        
        // Mostrar otros datos si están disponibles
        if (email) {
            customerDetailsHtml += `
                <div class="mb-2">
                    ${email}
                </div>`;
        }
        
        if (phoneNumber) {
            customerDetailsHtml += `
                <div class="mb-2">
                    ${phoneNumber}
                </div>`;
        }
        
        if (address) {
            customerDetailsHtml += `
                <div class="mb-2">
                    ${address}
                </div>`;
        }
        
        if (addressParts.length) {
            customerDetailsHtml += `
                <div class="mb-2">
                    ${addressParts.join(', ')}
                </div>`;
        }
        
        customerDetailsHtml += `
            </div>
        `;

        $('#customer-details').html(customerDetailsHtml);
    }

    /**
     * Apply customer data to the form (for logged in users).
     *
     * @param {Object} customer
     */
    function applyCustomerData(customer) {
        try {
            // Apply Customer's Data
            if (customer.last_name) {
                $lastName.val(customer.last_name);
            }
            if (customer.first_name) {
                $firstName.val(customer.first_name);
            }
            if (customer.email) {
                $email.val(customer.email);
            }
            if (customer.phone_number) {
                $phoneNumber.val(customer.phone_number);
            }
            if (customer.address) {
                $address.val(customer.address);
            }
            if (customer.city) {
                $city.val(customer.city);
            }
            if (customer.zip_code) {
                $zipCode.val(customer.zip_code);
            }
            // Siempre usar Europe/Madrid como zona horaria (entorno local)
            $selectTimezone.val('Europe/Madrid');
            if (customer.custom_field_1) {
                $customField1.val(customer.custom_field_1);
            }
            if (customer.custom_field_2) {
                $customField2.val(customer.custom_field_2);
            }
            if (customer.custom_field_3) {
                $customField3.val(customer.custom_field_3);
            }
            if (customer.custom_field_4) {
                $customField4.val(customer.custom_field_4);
            }
            if (customer.custom_field_5) {
                $customField5.val(customer.custom_field_5);
            }
            
            // Actualizar solo los detalles del cliente en el frame de confirmación
            updateCustomerDetails();
            
            return true;
        } catch (exc) {
            console.error('Error applying customer data:', exc);
            return false;
        }
    }

    function applyAppointmentData(appointment, provider, customer) {
        try {
            // Select Service & Provider
            $selectService.val(appointment.id_services).trigger('change');
            $selectProvider.val(appointment.id_users_provider);

            // Set Appointment Date
            const startMoment = moment(appointment.start_datetime);
            App.Utils.UI.setDateTimePickerValue($selectDate, startMoment.toDate());
            App.Http.Booking.getAvailableHours(startMoment.format('YYYY-MM-DD'));

            // Update unavailable dates while in manage mode

            App.Http.Booking.getUnavailableDates(
                appointment.id_users_provider,
                appointment.id_services,
                startMoment.format('YYYY-MM-DD'),
            );

            // Apply Customer's Data
            $lastName.val(customer.last_name);
            $firstName.val(customer.first_name);
            $email.val(customer.email);
            $phoneNumber.val(customer.phone_number);
            $address.val(customer.address);
            $city.val(customer.city);
            $zipCode.val(customer.zip_code);
            // Siempre usar Europe/Madrid como zona horaria (entorno local)
            $selectTimezone.val('Europe/Madrid');
            const appointmentNotes = appointment.notes !== null ? appointment.notes : '';
            $notes.val(appointmentNotes);

            $customField1.val(customer.custom_field_1);
            $customField2.val(customer.custom_field_2);
            $customField3.val(customer.custom_field_3);
            $customField4.val(customer.custom_field_4);
            $customField5.val(customer.custom_field_5);

            App.Pages.Booking.updateConfirmFrame();

            return true;
        } catch (exc) {
            return false;
        }
    }

    /**
     * Update the service description and information.
     *
     * This method updates the HTML content with a brief description of the
     * user selected service (only if available in db). This is useful for the
     * customers upon selecting the correct service.
     *
     * @param {Number} serviceId The selected service record id.
     */
    function updateServiceDescription(serviceId) {
        const $serviceDescription = $('#service-description');

        $serviceDescription.empty();

        const service = vars('available_services').find(
            (availableService) => Number(availableService.id) === Number(serviceId),
        );

        if (!service) {
            return; // Service not found
        }

        // Render the additional service information

        const additionalInfoParts = [];

        if (service.duration) {
            additionalInfoParts.push(`${lang('duration')}: ${service.duration} ${lang('minutes')}`);
        }

        if (Number(service.price) > 0) {
            additionalInfoParts.push(`${lang('price')}: ${Number(service.price).toFixed(2)} ${service.currency}`);
        }

        if (service.location) {
            additionalInfoParts.push(`${lang('location')}: ${service.location}`);
        }

        if (additionalInfoParts.length) {
            $(`
                <div class="mb-2 fst-italic">
                    ${additionalInfoParts.join(', ')}
                </div>
            `).appendTo($serviceDescription);
        }

        // Render the service description

        if (service.description?.length) {
            const escapedDescription = App.Utils.String.escapeHtml(service.description);

            const multiLineDescription = escapedDescription.replaceAll('\n', '<br/>');

            $(`
                <div class="text-muted">
                    ${multiLineDescription}
                </div>
            `).appendTo($serviceDescription);
        }
    }

    document.addEventListener('DOMContentLoaded', initialize);

    return {
        manageMode,
        updateConfirmFrame,
        updateServiceDescription,
        validateCustomerForm,
    };
})();
