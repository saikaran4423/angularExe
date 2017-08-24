// Install the angularjs.TypeScript.DefinitelyTyped NuGet package
namespace BD.ClientApp.Workspace {
    "use strict";

    import Domain = Common.Domain;

    export interface IEditStatisticsCtrl {
        title: string;
        activate: () => void;
    }

    interface IParameter {
        measurementId: string;
        measurementKind: string;
    };

    export class editStatisticsCtrl implements IEditStatisticsCtrl {
        title: string = "editStatisticsCtrl";

        localChangeSource = "editStatisticsCtrl";

        height: boolean = false;
        width: boolean = false;

        count: boolean = true;
        percentTotal: boolean = true;
        percentParent: boolean = true;
        percentGrandparent: boolean = true;

        selectedStats: Domain.IStatisticsTemplate[];
        measurementKindValues: Common.Domain.IMeasurementKindValues; //Variables to fetch the constants
        parameterKindValues: Common.Domain.IParameterKindValues; //Variables to fetch the constants
        experimentDataSvc: Common.Experiment.IExperimentDataSvc;
        statisticTypeValues: Common.Domain.IStatisticTypeValues;
        analysisChangeTypes: Common.Experiment.IAnalysisChangeTypes;

        static $inject: string[] = ["$location", "experimentDataSvc", "statisticTypeValues", "analysisChangeTypes", "measurementKindValues", "parameterKindValues", "locale"];

        constructor(private $location: ng.ILocationService,
            experimentDataSvc: Common.Experiment.IExperimentDataSvc,
            statisticTypeValues: Common.Domain.IStatisticTypeValues,
            analysisChangeTypes: Common.Experiment.IAnalysisChangeTypes,
            measurementKindValues: Common.Domain.IMeasurementKindValues,
            parameterKindValues: Common.Domain.IParameterKindValues,
            locale: any) {
            this.measurementKindValues = measurementKindValues;
            this.experimentDataSvc = experimentDataSvc;
            this.statisticTypeValues = statisticTypeValues;
            this.analysisChangeTypes = analysisChangeTypes;
            this.parameterKindValues = parameterKindValues;

            locale.ready("workspace").then(() => {

                this.cols = [{
                    stat: this.statisticTypeValues.arithmeticMean,
                    label: locale.getString('workspace.statcol_ArithmeticMean')
                },
                    // Median
                    {
                        stat: this.statisticTypeValues.median,
                        label: locale.getString('workspace.statcol_Median')
                    },
                    // geometric mean
                    {
                        stat: this.statisticTypeValues.geometricMean,
                        label: locale.getString('workspace.statcol_GeometricMean')
                    },
                    {
                        stat:
                        // Standard deviation
                        this.statisticTypeValues.standardDeviation,
                        label: locale.getString('workspace.statcol_StandardDeviation')
                    },

                    // Coefficient of variance
                    {
                        stat: this.statisticTypeValues.percentCv,
                        label: locale.getString('workspace.statcol_PercentCv')
                    },
                    // Robust Standard deviation
                    {
                        stat: this.statisticTypeValues.robustSd,
                        label: locale.getString('workspace.statcol_RobustSd')
                    },
                    // Robust Coefficient of variance
                    {
                        stat: this.statisticTypeValues.robustPercentCv,
                        label: locale.getString('workspace.statcol_RobustPercentCv')
                    },
                    // Min
                    {
                        stat: this.statisticTypeValues.min,
                        label: locale.getString('workspace.statcol_Min')
                    },
                    // Max
                    {
                        stat: this.statisticTypeValues.max,
                        label: locale.getString('workspace.statcol_Max')
                    },
                    // Mode 
                    {
                        stat: this.statisticTypeValues.mode,
                        label: locale.getString('workspace.statcol_Mode')
                    }
                ];
            });

            let experiment = this.experimentDataSvc.getExperiment();

            let stats = experiment.analysis.analysisWorksheets[1].statsConfig;


            this.count = stats.showAllEvents;
            this.percentTotal = stats.showTotalPercent;
            this.percentParent = stats.showParentPercent;
            this.percentGrandparent = stats.showGrandparentPercent;

            this.selectedStats = angular.copy(stats.statTemplates);

            this.height = this.viewHeight();
            this.width = this.viewWidth();
            this.params = this.getParamList(this.height, this.width);
            this.activate();
        }

        cols = [];

        //cols: string[] = ['Mean', 'Median', 'Geo Mean', 'SD', 'rSD', '%CV', '%rCV', 'Mode', 'Min', 'Max'];

        //To check if any height parameter is checked
        viewHeight() {
            for (var i = 0; i < this.selectedStats.length; i++) {
                if ((this.selectedStats[i].measurementKind) === this.measurementKindValues.height) {
                    return true;
                }
            }
            return false;
        }

        //to check if any width parameter is checked
        viewWidth() {
             for (var i = 0; i < this.selectedStats.length; i++) {
                if ((this.selectedStats[i].measurementKind) === this.measurementKindValues.width) {
                    return true;
                }
            }
             return false;
        }

        updateParameters() {
            this.params = this.getParamList(this.height, this.width);
        }


        params: IParameter[] = [];

        getParamList(height: boolean, width: boolean): IParameter[]{
            let params: Domain.IAnalysisParameter[] = this.experimentDataSvc.getAnalysisParameterSelectionList();

            // build the list of strings
            var list: IParameter[] = [];
            let appendTime = false;
              for (let p of params) {
                if (p.parameterKind === this.parameterKindValues.time) {
                    appendTime = true;
                }
                else {
                    list.push({
                        measurementId: p.measurementId,
                        measurementKind: this.measurementKindValues.area

                    });
                    if (height) {
                        list.push({
                            measurementId: p.measurementId,
                            measurementKind: this.measurementKindValues.height
                        });
                    }
                    if (width) {
                        list.push({
                            measurementId: p.measurementId,
                            measurementKind: this.measurementKindValues.width
                        });
                    }
                }
            }
            if (appendTime) {

                list.push({
                    measurementId: this.parameterKindValues.time,
                    measurementKind: ''
                });
            }

            return list;
        }

        activate() {

        }

        //Submit the stats selected or checked
        submitStatistics() {
            if (this.experimentDataSvc.startAnalysisChange(this.localChangeSource, this.analysisChangeTypes.editStatistics)) {
                let experiment = this.experimentDataSvc.getExperiment();

                let statsConfig = experiment.analysis.analysisWorksheets[1].statsConfig;
                statsConfig.showAllEvents = this.count;
                statsConfig.showTotalPercent = this.percentTotal;
                statsConfig.showParentPercent = this.percentParent;
                statsConfig.showGrandparentPercent = this.percentGrandparent;

                statsConfig.statTemplates = this.selectedStats;

                this.experimentDataSvc.endAnalysisChange(this.localChangeSource);
            }
        }

        //Not used
        toggleHeight() {

            this.height = !this.height;
        }

        //Not used
        toggleWidth() {

            this.width = !this.width;
        }

        //Updates if any stat is checked
        statSelected(param: IParameter, col: string) {
            return (this.selectedStats.some(s => s.measurementId === param.measurementId && s.statisticType === col && s.measurementKind === param.measurementKind));
        }

        //toggles the checkbox, pushes the the stat if it is checked
        toggleStatSelection(param: IParameter, col: string) {
            if (this.statSelected(param, col)) {
                this.selectedStats = this.selectedStats.filter(s => !(s.measurementId === param.measurementId && s.statisticType === col && s.measurementKind === param.measurementKind));
            } else {
                this.selectedStats.push({
                    measurementId: param.measurementId,
                    measurementKind: param.measurementKind,
                    statisticType: col
                });
            }
        }

        // Fetch the marker name for the stat
        getMarkerFromName(id: string): string {
            const labels = this.experimentDataSvc.getFluorochromeLabels();

            if (labels.has(id)) {
                return labels.get(id);
            }

            return id;
        }

        // Get the label for a column
        getColumnLabel(x: Common.Domain.IStatisticsTemplate): string {
            const translated = this.getMarkerFromName(x.measurementId);
            if (x.measurementKind.length != 0) {
                return (translated + '-' + x.measurementKind);
            }
            else {
                return translated;
            }
        }

        //returns parameter
        getParameter(param: IParameter): string {
            return this.getColumnLabel({
                measurementId: param.measurementId,
                measurementKind: param.measurementKind,
                statisticType: ''
            });
        }
        
        //To select all checkboxes in the column
        selectAllColumns(col: string) {
            if (this.isAllStatSelected(col)) {
                for (var i = 0; i < this.params.length; i++) {
                    this.selectedStats = this.selectedStats.filter(s => !(s.measurementId === this.params[i].measurementId && s.statisticType === col && s.measurementKind === this.params[i].measurementKind));
                }
            } else {
                for (var i = 0; i < this.params.length; i++) {
                    if (!this.statSelected(this.params[i], col)) {
                        this.selectedStats.push({
                            measurementId: this.params[i].measurementId,
                            measurementKind: this.params[i].measurementKind,
                            statisticType: col
                        });
                    }
                }
            }
        }

        //To check the select all check box if all the visible checkboxes of the column are checked
        isAllStatSelected(col: string) {
            var result = true;
            for (var i = 0; i < this.params.length; i++) {
                if (!this.statSelected(this.params[i], col)) {
                    return false;
                }
            }
            return true;
        }
    }

    angular.module("clientApp.workspace").controller("editStatisticsCtrl", editStatisticsCtrl);
}