sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
], function (BaseController, JSONModel, formatter, Filter, FilterOperator,MessageToast) {
    "use strict";

    return BaseController.extend("com.sap.soapp.controller.Worklist", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit : function () {
            var oViewModel;

            // keeps the search state
            this._aTableSearchState = [];

            // Model used to manipulate control states
            oViewModel = new JSONModel({
                worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText : this.getResourceBundle().getText("tableNoDataText")
            });
            this.setModel(oViewModel, "worklistView");
            this._oTable = this.byId("table0");

        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Triggered by the table's 'updateFinished' event: after new table
         * data is available, this handler method updates the table counter.
         * This should only happen if the update was successful, which is
         * why this handler is attached to 'updateFinished' and not to the
         * table's list binding's 'dataReceived' method.
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished : function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
        },

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress : function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        /**
         * Event handler for navigating back.
         * Navigate back in the browser history
         * @public
         */
        onNavBack : function() {
            // eslint-disable-next-line fiori-custom/sap-no-history-manipulation, fiori-custom/sap-browser-api-warning
            history.go(-1);
        },


        onSearch : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any main list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
            } else {
                var aTableSearchState = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState = [new Filter("soNumber", FilterOperator.Contains, sQuery)];
                }
                this._applySearch(aTableSearchState);
            }

        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh : function () {
            var oTable = this.byId("table");
            oTable.getBinding("items").refresh();
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Shows the selected item on the object page
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showObject : function (oItem) {
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext().getPath().substring("/SalesOrder".length)
            });
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function(aTableSearchState) {
            var oTable = this.byId("table"),
                oViewModel = this.getModel("worklistView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        },
        onOpenAddDialog: function () {
            this.getView().byId("OpenDialog").open();
         },
         onCancelDialog: function (oEvent) {
            oEvent.getSource().getParent().close();
         },
         onCreate: function () {
            var oSo = this.getView().byId("idSo").getValue();
            if (oSo !== "") {
                const oList = this._oTable;
                    const oBinding = oList.getBinding("items");
                    const oContext = oBinding.create({
                        "soNumber": this.byId("idSo").getValue(),
                        "customerName": this.byId("idCustName").getValue(),
                        "customerNumber": this.byId("idCustomer").getValue(),
                        "PoNumber": this.byId("idPo").getValue(),
                        "inquiryNumber": this.byId("idInqNumber").getValue()      
                    });
                    oContext.created()
                    .then(()=>{
                            // that._focusItem(oList, oContext);
                            this.getView().byId("OpenDialog").close();
                    });

            }else {
                MessageToast.show("So cannot be blank");
            }

        },
        onEditMode: function(){
            this.byId("editModeButton").setVisible(false);
            this.byId("saveButton").setVisible(true);
            this.byId("deleteButton").setVisible(true);
            // this.rebindTable(this.oEditableTemplate, "Edit");
       },
       onDelete: function(){

        var oSelected = this.byId("table0").getSelectedItem();
        if(oSelected){
            var oSalesOrder = oSelected.getBindingContext("mainModel").getObject().soNumber;
        
            oSelected.getBindingContext("mainModel").delete("$auto").then(function () {
                MessageToast.show(oSalesOrder + " SuccessFully Deleted");
            }.bind(this), function (oError) {
                MessageToast.show("Deletion Error: ",oError);
            });
        } else {
            MessageToast.show("Please Select a Row to Delete");
        }
        
    },

    });
});
