import * as React from "react";
import * as ReactDOM from "react-dom";
import { IEventRowState, EventRow, IWhereClause, IGroupClause } from "../eventrows";
import { Button } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { IEvent } from "../../models/event";
import { IEventStore } from "../../app-stores/events";
import { observer, inject } from "mobx-react";


export interface IEventGroupProp {
    eventStore: IEventStore
}

export interface IEventRowRef {
  rowState: IEventRowState;
  index: number;
}

export interface IEventGroupState {
  eventRows: IEventRowRef[];
}

// @inject("eventStore")
// @observer
export class EventGroup extends React.Component<IEventGroupProp, IEventGroupState> {
  lastEventRowCount: number = 0;
  constructor(props: IEventGroupProp) {
    super(props);
    this.state = {
      eventRows: []
    };
  }

  updateEventRowEvent = (rowIndex: number, value: string)  => {
    this.setState({
        eventRows: this.state.eventRows.map<IEventRowRef>(row => {
            if(row.index == rowIndex) {
                row.rowState.eventSelected = value;
            }
            return row;
        })
    })
  }

  updateWhereClauseProperty = (rowIndex: number, whereClauseIndex: number, value: string) => {
    this.setState({
        eventRows: this.state.eventRows.map<IEventRowRef>(row => {
            if(row.index == rowIndex) {
                row.rowState.whereClauses = row.rowState.whereClauses.map<IWhereClause>(whereClause => {
                    if(whereClause.whereClauseIndex == whereClauseIndex) {
                        whereClause.property = value
                    }

                    return whereClause
                })
            }
            return row;
        })
    })
  }

  updateGroupClauseProperty = (rowIndex: number, groupclauseIndex: number, value: string) => {
    this.setState({
        eventRows: this.state.eventRows.map<IEventRowRef>(row => {
            if(row.index == rowIndex) {
                row.rowState.groupClauses = row.rowState.groupClauses.map<IGroupClause>(groupClause => {
                    if(groupClause.groupClauseIndex == groupclauseIndex) {
                        groupClause.property = value
                    }

                    return groupClause
                })
            }
            return row;
        })
    })
  }
  updateWhereClausePropertyValue = (rowIndex: number, whereClauseIndex: number, value: string) => {
    this.setState({
        eventRows: this.state.eventRows.map<IEventRowRef>(row => {
            if(row.index == rowIndex) {
                row.rowState.whereClauses = row.rowState.whereClauses.map<IWhereClause>(whereClause => {
                    if(whereClause.whereClauseIndex == whereClauseIndex) {
                        whereClause.propertyValue = value
                    }

                    return whereClause
                })
            }
            return row;
        })
    })
  }
  updateWhereClauseCompValue = (rowIndex: number, whereClauseIndex: number, value: string) => {
    this.setState({
        eventRows: this.state.eventRows.map<IEventRowRef>(row => {
            if(row.index == rowIndex) {
                row.rowState.whereClauses = row.rowState.whereClauses.map<IWhereClause>(whereClause => {
                    if(whereClause.whereClauseIndex == whereClauseIndex) {
                        whereClause.compValue = value
                    }

                    return whereClause
                })
            }
            return row;
        })
    })
  }
  removeWhereClause = (rowIndex: number, whereClauseIndex: number) => {
    this.setState({
        eventRows: this.state.eventRows.map<IEventRowRef>(row => {
            if(row.index == rowIndex) {
                row.rowState.whereClauses = row.rowState.whereClauses.filter(whereClause => {
                    return whereClause.whereClauseIndex != whereClauseIndex
            })
        }
            return row;
        })
    })
  }
  removeGroupClause = (rowIndex: number, groupClauseIndex: number) => {
    this.setState({
        eventRows: this.state.eventRows.map<IEventRowRef>(row => {
            if(row.index == rowIndex) {
                row.rowState.groupClauses = row.rowState.groupClauses.filter(groupClause => {
                    return groupClause.groupClauseIndex != groupClauseIndex
            })
        }
            return row;
        })
    })
  }
  addWhereClause = (rowIndex: number, whereClauseIndex: number, eventRowEvent:IEvent) => {
    this.setState({
        eventRows: this.state.eventRows.map<IEventRowRef>(row => {
            if(row.index == rowIndex) {
                row.rowState.whereClauses = row.rowState.whereClauses.concat({
                            event: eventRowEvent,
                            property: '',
                            propertyValue: '',
                            compValue: '',
                            whereClauseIndex: whereClauseIndex,
                            eventRowIndex: rowIndex,
                            updateProperty: this.updateWhereClauseProperty,
                            updateCompValue: this.updateWhereClauseCompValue,
                            updatePropertyValue: this.updateWhereClausePropertyValue,
                            removeFn: this.removeWhereClause
                }) 
            }
            return row;
        })
    })

  }
  addGroupClause = (rowIndex: number, groupClauseIndex: number, eventRowEvent:IEvent) => {
    this.setState({
        eventRows: this.state.eventRows.map<IEventRowRef>(row => {
            if(row.index == rowIndex) {
                row.rowState.groupClauses = row.rowState.groupClauses.concat({
                            event: eventRowEvent,
                            property: '',
                            groupClauseIndex: groupClauseIndex,
                            eventRowIndex: rowIndex,
                            updateProperty: this.updateGroupClauseProperty,
                            removeFn: this.removeGroupClause
                }) 
            }
            return row;
        })
    })
  }

  onAddButtonClicked = () => {
    console.log("======ADDING ROW====", this.lastEventRowCount);
    this.setState({
        eventRows: this.state.eventRows.concat({
            rowState: {eventSelected: '', whereClauses: [], groupClauses: []},
            index: this.lastEventRowCount
        })
    })
    this.lastEventRowCount++;
  }

  onEventRowRemoved = (index: number) => {
    console.log("======REMOVING ROW====", index)
    this.setState({
        eventRows: this.state.eventRows.filter(clause => {
          return index != clause.index;
        })
      });
  }

  fetchState = () => {
      console.log("=====PRESENT STATE====== ", JSON.stringify(this.state.eventRows))
      return this.state.eventRows
  }


  render() {
    //console.log("event rows length" + this.state.eventRows.length + " " + this.lastEventRowCount + ' ' + this.state.eventRows)
    return (
      <>
        <p> Events </p>
        <Button
          type="primary"
          shape="round"
          icon={<PlusCircleOutlined />}
          size= 'middle'
          disabled={this.state.eventRows.length > 0 && this.state.eventRows[this.state.eventRows.length-1].rowState.eventSelected == ''}
          onClick={() => this.onAddButtonClicked()}
        >
          Add Events...
        </Button>
        {this.state.eventRows.map(clause => (
            <EventRow eventRow={{
                eventStore: this.props.eventStore,
                rowIndex: clause.index,
                rowState: clause.rowState,
                removeFn: this.onEventRowRemoved,
                updateEventRowEvent: this.updateEventRowEvent,
                updateWhereClauseProperty:this.updateWhereClauseProperty,
                updateGroupClauseProperty:this.updateGroupClauseProperty,
                updateWhereClausePropertyValue: this.updateWhereClausePropertyValue,
                updateWhereClauseCompValue: this.updateWhereClauseCompValue,
                removeWhereClause: this.removeWhereClause,
                removeGroupClause: this.removeGroupClause,
                addWhereClause: this.addWhereClause,
                addGroupClause: this.addGroupClause
            }} />
          ))}
      </>
    );
  }
}
