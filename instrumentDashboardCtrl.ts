/// <reference path="../../../scripts/typings/moment/moment.d.ts" />

namespace BD.ClientApp.Workspace {

    //#region View Models

    // View model for the Recording Stop
    interface IRecordingStopViewModel {

        selectedStoppingRule?: string;

        eventCount?: number;

        eventPopulation?: Common.Domain.IDisplayPopulation;
    }

    // View model for the recording progress bar
    interface IRecordingProgressViewModel {

        currentEventCount?: number;

        currentEventPercent?: number;

        targetEventCount?: number;

    }

    //#endregion

    // Instrument Dashboard Controller
    export class instrumentDashboardCtrl {

        //#region Class Fields

        workspaceAgentSvc: Services.IWorkspaceAgentSvc;
        workspaceStateSvc: Services.IWorkspaceStateSvc;
        workspaceAgentState: Services.IWorkspaceAgentState;
        domainUtilitySvc: Common.Domain.IDomainUtilitySvc;
        experiment: Common.Domain.IExperimentModel;
        experimentStatus: Common.Experiment.IExperimentStatus;
        experimentDataSvc: Common.Experiment.IExperimentDataSvc;
        scope: ng.IScope;
        recordingStopViewModel: IRecordingStopViewModel = {};
        recordingProgressViewModel: IRecordingProgressViewModel = {};
        ruleKindValues: Common.Domain.IRuleKindValues;
        populationConstants: Common.Domain.IPopulationConstants;
        $log: ng.ILogService;
        populationStoppingRuleSelected: boolean;
        timeStoppingRuleSelected: boolean;
        guidSvc: Common.Utility.IGuidSvc;
        dataRecordStateValues: Common.Domain.IDataRecordStateValues;
        dataRecordsChangeTypes: Common.Experiment.IDataRecordsChangeTypes;
        localizedText: any = {
            button_label_load_unload: "",
            button_label_pause_resume: "",
            button_label_start_stop_record: ""
        };
        $document: ng.IDocumentService;
        elapsedStartTime: number = 0;
        localFlowRate: number;
        sampleSettingsChangeTypes: Common.Experiment.ISampleSettingsChangeTypes;
        timerRunning: boolean = false;
        populationSvc: Services.IPopulationSvc;
        experimentDataRecordSvc: Common.Experiment.IExperimentDataRecordSvc;
        recordingAssociationTypeValues: Common.Domain.IRecordingAssociationTypeValues;
        recordingCategoryValues: Common.Domain.IRecordingCategoryValues;
        instrumentEventNames: Common.Constants.IInstrumentEventNames;
        instrumentEventTypes: Common.Constants.IInstrumentEventTypes;
        ngDialog;

        // Constants
        localChangeSource = "instrumentDashboardCtrl";
        elapsedTimerSelector = "#instrument_dashboard_elapsed_time_timer";

        //#endregion

        //#region Injector

        static $inject = [
            "workspaceAgentSvc",
            "workspaceStateSvc",
            "domainUtilitySvc",
            "experimentDataSvc",
            "$scope",
            "experimentEvents",
            "ruleKindValues",
            "populationConstants",
            "$log",
            "guidSvc",
            "dataRecordStateValues",
            "dataRecordsChangeTypes",
            "locale",
            "$document",
            "sampleSettingsChangeTypes",
            "populationSvc",
            "experimentDataRecordSvc",
            "recordingAssociationTypeValues",
            "recordingCategoryValues",
            "instrumentEventNames",
            "instrumentEventTypes",
            "ngDialog"
        ];

        //#endregion

        //#region Constructor

        constructor(
            workspaceAgentSvc: Services.IWorkspaceAgentSvc,
            workspaceStateSvc: Services.IWorkspaceStateSvc,
            domainUtilitySvc: Common.Domain.IDomainUtilitySvc,
            experimentDataSvc: Common.Experiment.IExperimentDataSvc,
            $scope: any,
            experimentEvents: Common.Experiment.IExperimentEvents,
            ruleKindValues: Common.Domain.IRuleKindValues,
            populationConstants: Common.Domain.IPopulationConstants,
            $log: ng.ILogService,
            guidSvc: Common.Utility.IGuidSvc,
            dataRecordStateValues: Common.Domain.IDataRecordStateValues,
            dataRecordsChangeTypes: Common.Experiment.IDataRecordsChangeTypes,
            locale: any,
            $document: ng.IDocumentService,
            sampleSettingsChangeTypes: Common.Experiment.ISampleSettingsChangeTypes,
            populationSvc: Services.IPopulationSvc,
            experimentDataRecordSvc: Common.Experiment.IExperimentDataRecordSvc,
            recordingAssociationTypeValues: Common.Domain.IRecordingAssociationTypeValues,
            recordingCategoryValues: Common.Domain.IRecordingCategoryValues,
            instrumentEventNames: Common.Constants.IInstrumentEventNames,
            instrumentEventTypes: Common.Constants.IInstrumentEventTypes,
            ngDialog) {

            const self = this;
            self.workspaceAgentSvc = workspaceAgentSvc;
            self.workspaceStateSvc = workspaceStateSvc;
            self.workspaceAgentState = workspaceStateSvc.workspaceAgentState;
            self.domainUtilitySvc = domainUtilitySvc;
            self.experimentDataSvc = experimentDataSvc;
            self.scope = $scope;
            self.ruleKindValues = ruleKindValues;
            self.populationConstants = populationConstants;
            self.$log = $log;
            self.guidSvc = guidSvc;
            self.dataRecordStateValues = dataRecordStateValues;
            self.dataRecordsChangeTypes = dataRecordsChangeTypes;
            self.$document = $document;
            self.sampleSettingsChangeTypes = sampleSettingsChangeTypes;
            self.populationSvc = populationSvc;
            self.experimentDataRecordSvc = experimentDataRecordSvc;
            self.recordingAssociationTypeValues = recordingAssociationTypeValues;
            self.recordingCategoryValues = recordingCategoryValues;
            self.instrumentEventNames = instrumentEventNames;
            self.instrumentEventTypes = instrumentEventTypes;
            self.ngDialog = ngDialog;

            // Load localized text
            locale.ready('instrumentDashboard').then(() => {
                self.localizedText.button_label_load =
                locale.getString("instrumentDashboard.button_label_load");
                self.localizedText.button_label_unload =
                locale.getString("instrumentDashboard.button_label_unload");
                self.localizedText.button_label_pause =
                locale.getString("instrumentDashboard.button_label_pause");
                self.localizedText.button_label_resume =
                locale.getString("instrumentDashboard.button_label_resume");
                self.localizedText.button_label_start_recording =
                locale.getString("instrumentDashboard.button_label_start_recording");
                self.localizedText.button_label_stop_recording =
                locale.getString("instrumentDashboard.button_label_stop_recording");
                self.localizedText.button_label_start_sort =
                locale.getString("instrumentDashboard.button_label_start_sort");
                self.localizedText.button_label_stop_sort =
                locale.getString("instrumentDashboard.button_label_stop_sort");
                self.localizedText.button_label_pause_sort =
                locale.getString("instrumentDashboard.button_label_pause_sort");
                self.localizedText.button_label_resume_sort =
                locale.getString("instrumentDashboard.button_label_resume_sort");

                //  Initialize button text
                self.recalculateButtonText();

            });

            // Load Experiment
            self.experiment = experimentDataSvc.getExperiment();
            self.experimentStatus = experimentDataSvc.getExperimentStatus();

            // Populate Initial Flow Rate
            self.localFlowRate = self.experiment.specimens[0].sampleSettings.sampleFlowRatePercent;

            // Analysis Changed Event Handler
            self.scope.$on(experimentEvents.analysisChanged, (event, eventData: Common.Experiment.IAnalysisChangedEventData) => {

                // All Events selected, return
                if (self.recordingStopViewModel.eventPopulation.populationId === self.populationConstants.allEventsPopulationId)
                    return;

                // If selected population no longer exists, reset back to all events
                const population = self.domainUtilitySvc.getPopulation(
                    self.recordingStopViewModel.eventPopulation.populationId,
                    self.experiment.analysis);

                if (!population) {
                    self.recordingStopViewModel.eventPopulation = self.domainUtilitySvc.getAllEventsPopulation();

                    self.saveExperimentRecordingStopRule();
                }
            });
         
            // Populate Stopping Model
            self.populateRecordingStoppingModel();

            // Populate Recording Progress Model
            self.populateRecordingProgressViewModel();

            // Watch showLoadSample to update button text
            $scope.$watch('vm.workspaceAgentState.controlState.showLoadSample', function (newValue, oldValue) {
                self.recalculateButtonText();
            });

            // Watch showPauseSample to update button text
            $scope.$watch('vm.workspaceAgentState.controlState.showPauseSample', function (newValue, oldValue) {
                self.recalculateButtonText();
            });

            // Watch showStartRecording to update button text
            $scope.$watch('vm.workspaceAgentState.controlState.showStartRecording', function (newValue, oldValue) {
                self.recalculateButtonText();
            });

            // Watch acquisitionTimerState to update the elapsed timer
            $scope.$watch('vm.workspaceStateSvc.workspaceAgentState.controlState.acquisitionTimerState',
                (timerState: Services.ITimerState, oldTimerState : Services.ITimerState) => {

                    self.refreshTimer(timerState);
                });

            // Watch showStartSort to update button text
            $scope.$watch('vm.workspaceAgentState.controlState.showStartSort', function (newValue, oldValue) {
                self.recalculateButtonText();
            });

            // Watch showPauseSort to update button text
            $scope.$watch('vm.workspaceAgentState.controlState.showPauseSort', function (newValue, oldValue) {
                self.recalculateButtonText();
            });

            // Watch showStartRecording to update button text
            $scope.$watch('vm.workspaceAgentState.controlState.recordingCount', function (newValue, oldValue) {
                self.recordingProgressViewModel.currentEventCount = self.workspaceAgentState.controlState.recordingCount;
                self.recordingProgressViewModel.currentEventPercent =
                (self.recordingProgressViewModel.currentEventCount / self.recordingProgressViewModel.targetEventCount) * 100;
            });


        }      
      
        //#endregion

        //#region Kendo Options

        // Flow Rate Control
        flowRateOptions: kendo.ui.NumericTextBoxOptions = {
            format: "n0"
        };

        // Event Stopping Count Control
        eventStoppingCountOptions: kendo.ui.NumericTextBoxOptions = {
            format: "n0"
        };

        // Recording progress bar options
        recordingProgressOptions: kendo.ui.ProgressBarOptions = {
            min: 0,
            max: 100,
            showStatus: false,
            animation: false
        }

        //#endregion

        //#region Methods

        // Initial population of the stopping model
        populateRecordingStoppingModel() {

            const self = this;

            const currentStoppingRule = self.experiment.specimens[0].recordingStoppingRule;
            if (currentStoppingRule) {

                self.recordingStopViewModel = {
                    selectedStoppingRule: currentStoppingRule.ruleKind
                };

                switch (currentStoppingRule.ruleKind) {
                    case self.ruleKindValues.populationBased:
                        self.recordingStopViewModel.eventPopulation =
                        self.domainUtilitySvc.getPopulation(
                            currentStoppingRule.stoppingPopulation,
                            self.experiment.analysis);
                        self.recordingStopViewModel.eventCount = currentStoppingRule.count;
                        break;
                    default:
                        self.$log.error("Invalid stopping ruleKind");
                }
            }
            else {
                self.$log.error("Experiment contains no recording stopping rule.");
            }
        }

        // Initial population of the Recording Progress Model
        populateRecordingProgressViewModel() {

            const self = this;

            self.recordingProgressViewModel.targetEventCount = self.recordingStopViewModel.eventCount;

            self.recordingProgressViewModel.currentEventCount = self.workspaceAgentState.controlState.recordingCount;

            self.recordingProgressViewModel.currentEventPercent =
            (self.recordingProgressViewModel.currentEventCount / self.recordingProgressViewModel.targetEventCount) * 100;
        }

        // Constructs the stopping rule from the model
        getStoppingRuleFromViewModel(): Common.Domain.IStoppingRule {

            let retVal: Common.Domain.IStoppingRule = {
                ruleKind: this.recordingStopViewModel.selectedStoppingRule,
            }

            switch (retVal.ruleKind) {
                case this.ruleKindValues.populationBased:
                    retVal.stoppingPopulation = this.recordingStopViewModel.eventPopulation.populationId;
                    retVal.count = this.recordingStopViewModel.eventCount;
                    break;
                default:
                    this.$log.error("Invalid rulekind");
            }

            return retVal;
        }

        // Handles the Recording Stop Rule Changed
        recordingStopRuleChanged() {
            this.populateRecordingProgressViewModel();
            this.saveExperimentRecordingStopRule();
        }

        // Updates the experiment Recording Stop Rule
        saveExperimentRecordingStopRule() {

            // FUTURE: If needed, add Start Change / End Change Calls for stopping rule.

            // Update Experiment Model
            this.experiment.specimens[0].recordingStoppingRule = this.getStoppingRuleFromViewModel()
        }

        // Toggle dashboard collapsed state
        toggleDashboardCollapsed() {
            this.workspaceStateSvc.workspaceUiState.sampleDashboardCollapsed =
            !this.workspaceStateSvc.workspaceUiState.sampleDashboardCollapsed;
        }

        // Toggle sort dashboard collapsed state
        toggleSortDashboardCollapsed() {
            this.workspaceStateSvc.workspaceUiState.sortDashboardCollapsed =
            !this.workspaceStateSvc.workspaceUiState.sortDashboardCollapsed;
        }

        // Recalculate Button Text
        recalculateButtonText() {
            const self = this;
            if (self.workspaceAgentState.controlState.showLoadSample) {
                self.localizedText.button_label_load_unload = self.localizedText.button_label_load;
            } else {
                self.localizedText.button_label_load_unload = self.localizedText.button_label_unload;
            }

            if (self.workspaceAgentState.controlState.showPauseSample) {
                self.localizedText.button_label_pause_resume = self.localizedText.button_label_pause;
            } else {
                self.localizedText.button_label_pause_resume = self.localizedText.button_label_resume;
            }

            if (self.workspaceAgentState.controlState.showStartRecording) {
                self.localizedText.button_label_start_stop_record = self.localizedText.button_label_start_recording;
            } else {
                self.localizedText.button_label_start_stop_record = self.localizedText.button_label_stop_recording;
            }

            if (self.workspaceAgentState.controlState.showStartSort) {
                self.localizedText.button_label_start_stop_sort = self.localizedText.button_label_start_sort;
            } else {
                self.localizedText.button_label_start_stop_sort = self.localizedText.button_label_stop_sort;
            }

            if (self.workspaceAgentState.controlState.showPauseSort) {
                self.localizedText.button_label_pause_resume_sort = self.localizedText.button_label_pause_sort;
            } else {
                self.localizedText.button_label_pause_resume_sort = self.localizedText.button_label_resume_sort;
            }
        }

        // Handle Flow Rate Changed
        onFlowRateChanged() {

            let newFlowRate: number;
            if (this.localFlowRate) {
                newFlowRate = Number(this.localFlowRate);

                this.updateFlowRate(newFlowRate);
            }
        }

        // Updates the flow rate
        updateFlowRate = (newFlowRate: number) : void => {

            // If value is not valid, return and do not update
            if ((newFlowRate < 1)
                || (newFlowRate > 100)
                || (this.experiment.specimens[0].sampleSettings.sampleFlowRatePercent === newFlowRate)) return;

            // Update experiment
            this.experimentDataSvc.startSampleSettingsChange(this.localChangeSource, this.sampleSettingsChangeTypes.updateFlowRate);

            this.experiment.specimens[0].sampleSettings.sampleFlowRatePercent = newFlowRate;

            this.experimentDataSvc.endSampleSettingsChange(this.localChangeSource);

            // Send instrument command
            this.workspaceAgentSvc.updateFlowRate(newFlowRate);
        }

        // Handle Flow Rate Changed
        onEventStoppingCountChanged() {

            this.saveExperimentRecordingStopRule();

        }

        // Updates the flow rate
        updateEventStoppingCount = (newEventStoppingCount: number) : void => {

            // If value is not valid, return and do not update
            if ((newEventStoppingCount < 1)
                || (this.recordingStopViewModel.eventCount === newEventStoppingCount)) return;

            // Update view model
            this.recordingStopViewModel.eventCount = newEventStoppingCount

            // Save the update
            this.saveExperimentRecordingStopRule();
        }

        // Refreshes the elapsed timer
        refreshTimer(timerState: Services.ITimerState) {

            let timer: any = angular.element(this.elapsedTimerSelector)[0];

            let startTime;

            if (timerState.timerRunning) {

                if (!this.timerRunning) {
                    timer.reset(true);
                }

                // Use Start Time to set
                if (timerState.startUtc) {
                    startTime = moment(JSON.parse(timerState.startUtc));
                } else {
                    startTime = moment();
                }
            } else {
                // Use Stop Time to set
                if (timerState.stopUtc) {
                    let startDate = moment(JSON.parse(timerState.startUtc));
                    let stopDate = moment(JSON.parse(timerState.stopUtc));

                    startTime = moment().add(moment.duration(startDate.diff(stopDate)));

                } else {
                    startTime = moment();
                }
            }
            timer.start(startTime);
            if (!timerState.timerRunning) {
                timer.stop();
            }

            this.timerRunning = timerState.timerRunning;
        }

        // Initializes the elapsed timer
        initializeTimer() {
            const timer: any = angular.element(this.elapsedTimerSelector)[0];

            const timerState = this.workspaceStateSvc.workspaceAgentState.controlState.acquisitionTimerState;

            if (timerState.timerRunning) {
                // Use Start Time to set

                if (timerState.startUtc) {
                    timer.start(moment(JSON.parse(timerState.startUtc)));
                } else {
                    timer.start(moment());
                }

            } else {
                // Use Stop Time to set

                if (timerState.stopUtc) {
                    let startDate = moment(JSON.parse(timerState.startUtc));
                    let stopDate = moment(JSON.parse(timerState.stopUtc));

                    let startTime = moment().add(moment.duration(startDate.diff(stopDate)));

                    timer.start(startTime);

                } else {
                    timer.start(moment());
                }
                timer.stop();
            }
            this.timerRunning = timerState.timerRunning;
        }
      
        // Handles actions from the load/unload button
        loadUnloadSample() {
            if (this.workspaceStateSvc.workspaceAgentState.controlState.showLoadSample &&
                this.workspaceStateSvc.workspaceAgentState.controlState.enableLoadSample) {
                this.loadSample();
            }
            else if ((!this.workspaceStateSvc.workspaceAgentState.controlState.showLoadSample) &&
                this.workspaceStateSvc.workspaceAgentState.controlState.enableUnloadSample) {
                this.unloadSample();
            }
        }

        // Handles actions from the pause/resume button
        pauseResumeSample() {
            if (this.workspaceStateSvc.workspaceAgentState.controlState.showPauseSample &&
                this.workspaceStateSvc.workspaceAgentState.controlState.enablePauseSample) {
                this.pauseSample();
            }
            else if ((!this.workspaceStateSvc.workspaceAgentState.controlState.showPauseSample) &&
                this.workspaceStateSvc.workspaceAgentState.controlState.enableResumeSample) {
                this.resumeSample();
            }
        }

        // Handles actions from the start/stop record button
        startStopRecord() {
            if (this.workspaceStateSvc.workspaceAgentState.controlState.showStartRecording &&
                this.workspaceStateSvc.workspaceAgentState.controlState.enableStartRecording) {
                this.startRecording();
            }
            else if ((!this.workspaceStateSvc.workspaceAgentState.controlState.showStartRecording) &&
                this.workspaceStateSvc.workspaceAgentState.controlState.enableStopRecording) {
                this.stopRecording();
            }
        }

        // Load Sample
        loadSample() {
            // TODO: Handle Failures
            this.workspaceAgentSvc.loadSample(undefined, undefined);
        }

        // Unload Sample
        unloadSample() {
            // Stop elapsed timer
            let timer: any = angular.element(this.elapsedTimerSelector)[0];
            timer.stop();

            // TODO: Handle Failures
            this.workspaceAgentSvc.unloadSample(undefined, undefined);
        }

        // Pause Sample
        pauseSample() {
            // TODO: Handle Failures
            this.workspaceAgentSvc.pauseSample(undefined, undefined);
        }

        // Resume Sample
        resumeSample() {
            // TODO: Handle Failures
            this.workspaceAgentSvc.resumeSample(undefined, undefined);
        }

        // Start Recording
        startRecording() {

            const self = this;

            // Generate new Recording Id & Name
            const newDataRecordId = self.guidSvc.createUUID();
            const newDataRecordName = self.experimentDataRecordSvc.getNextDefaultDataRecordName();

            // Send agent command
            self.workspaceAgentSvc.startRecording(newDataRecordId, newDataRecordName,
                (successResponse) => {
                    if (successResponse.succeeded) {
                     
                        // Update progress bar count
                        self.recordingProgressViewModel.targetEventCount = self.recordingStopViewModel.eventCount;

                        this.experimentDataRecordSvc.reloadDataRecords(undefined, undefined);
                    }
                    else {
                        // TODO: Handle error
                        self.$log.error(successResponse);
                    }
                },
                (errorResponse) => {

                    // TODO: Handle error
                    self.$log.error(errorResponse);

                });
        }

        // Stop Recording
        stopRecording() {
            const self = this;
            let currentDataRecordId = self.workspaceAgentState.controlState.dataRecordId;

            self.workspaceAgentSvc.stopRecording(
                (successResponse) => {

                    if (successResponse.succeeded) {

                        // FUTURE: Handle Success

                    }
                    else {
                        // Handle error
                        self.$log.error(successResponse);
                    }
                },
                (errorResponse) => {
                    // Handle error
                    self.$log.error(errorResponse);
                });
        }

         //#endregion

    }
    
    // Register the controller with the application
    angular.module("clientApp.workspace")
        .controller("instrumentDashboardCtrl", instrumentDashboardCtrl);
}
