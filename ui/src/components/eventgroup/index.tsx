import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  IEventRowState,
  EventRow,
  IWhereClause,
  IGroupClause,
} from "../eventrows";
import { Button } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { IEvent } from "../../models/event";
import { IEventStore } from "../../app-stores/events";
import { observer, inject } from "mobx-react";
import { Label, EventLabel } from "../../App";

import styled from "styled-components";


// margin-left: 24px ;
// margin-right: auto;
export const EventGroupContent = styled.div`
display: flex;
flex-flow: column wrap;
margin-bottom: 32px;
margin-top: 20px;
`
export interface IEventGroupProp {
  eventStore: IEventStore;
  updateSqlState(eventRows:IEventRowRef[]):void
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
export class EventGroup extends React.Component<
  IEventGroupProp,
  IEventGroupState
> {
  lastEventRowCount: number = 0;
  constructor(props: IEventGroupProp) {
    super(props);
    this.state = {
      eventRows: [],
    };
  }

  updateEventRowEvent = (rowIndex: number, value: string) => {
    this.setState({
      eventRows: this.state.eventRows.map<IEventRowRef>((row) => {
        if (row.index == rowIndex) {
          row.rowState.eventSelected = value;
        }
        return row;
      }),
    });
    setTimeout(() => {
      this.props.updateSqlState(this.state.eventRows)
    })
    
  };

  updateWhereClauseProperty = (
    rowIndex: number,
    whereClauseIndex: number,
    value: string
  ) => {
    this.setState({
      eventRows: this.state.eventRows.map<IEventRowRef>((row) => {
        if (row.index == rowIndex) {
          row.rowState.whereClauses = row.rowState.whereClauses.map<
            IWhereClause
          >((whereClause) => {
            if (whereClause.whereClauseIndex == whereClauseIndex) {
              whereClause.property = value;
            }

            return whereClause;
          });
        }
        return row;
      }),
    });
    setTimeout(() => {
      this.props.updateSqlState(this.state.eventRows)
    })
  };

  updateGroupClauseProperty = (
    rowIndex: number,
    groupclauseIndex: number,
    value: string
  ) => {
    this.setState({
      eventRows: this.state.eventRows.map<IEventRowRef>((row) => {
        if (row.index == rowIndex) {
          row.rowState.groupClauses = row.rowState.groupClauses.map<
            IGroupClause
          >((groupClause) => {
            if (groupClause.groupClauseIndex == groupclauseIndex) {
              groupClause.property = value;
            }

            return groupClause;
          });
        }
        return row;
      }),
    });
    setTimeout(() => {
      this.props.updateSqlState(this.state.eventRows)
    })
  };
  updateWhereClausePropertyValue = (
    rowIndex: number,
    whereClauseIndex: number,
    value: string
  ) => {
    this.setState({
      eventRows: this.state.eventRows.map<IEventRowRef>((row) => {
        if (row.index == rowIndex) {
          row.rowState.whereClauses = row.rowState.whereClauses.map<
            IWhereClause
          >((whereClause) => {
            if (whereClause.whereClauseIndex == whereClauseIndex) {
              whereClause.propertyValue = value;
            }

            return whereClause;
          });
        }
        return row;
      }),
    });
    setTimeout(() => {
      this.props.updateSqlState(this.state.eventRows)
    })
  };
  updateWhereClauseCompValue = (
    rowIndex: number,
    whereClauseIndex: number,
    value: string
  ) => {
    this.setState({
      eventRows: this.state.eventRows.map<IEventRowRef>((row) => {
        if (row.index == rowIndex) {
          row.rowState.whereClauses = row.rowState.whereClauses.map<
            IWhereClause
          >((whereClause) => {
            if (whereClause.whereClauseIndex == whereClauseIndex) {
              whereClause.compValue = value;
            }

            return whereClause;
          });
        }
        return row;
      }),
    });
    setTimeout(() => {
      this.props.updateSqlState(this.state.eventRows)
    })
  };
  removeWhereClause = (rowIndex: number, whereClauseIndex: number) => {
    this.setState({
      eventRows: this.state.eventRows.map<IEventRowRef>((row) => {
        if (row.index == rowIndex) {
          row.rowState.whereClauses = row.rowState.whereClauses.filter(
            (whereClause) => {
              return whereClause.whereClauseIndex != whereClauseIndex;
            }
          );
        }
        return row;
      }),
    });
    setTimeout(() => {
      this.props.updateSqlState(this.state.eventRows)
    })
  };
  removeGroupClause = (rowIndex: number, groupClauseIndex: number) => {
    this.setState({
      eventRows: this.state.eventRows.map<IEventRowRef>((row) => {
        if (row.index == rowIndex) {
          row.rowState.groupClauses = row.rowState.groupClauses.filter(
            (groupClause) => {
              return groupClause.groupClauseIndex != groupClauseIndex;
            }
          );
        }
        return row;
      }),
    });
    setTimeout(() => {
      this.props.updateSqlState(this.state.eventRows)
    })
  };
  addWhereClause = (
    rowIndex: number,
    whereClauseIndex: number,
    eventRowEvent: IEvent
  ) => {
    this.setState({
      eventRows: this.state.eventRows.map<IEventRowRef>((row) => {
        if (row.index == rowIndex) {
          row.rowState.whereClauses = row.rowState.whereClauses.concat({
            event: eventRowEvent,
            property: "",
            propertyValue: "",
            compValue: "",
            whereClauseIndex: whereClauseIndex,
            eventRowIndex: rowIndex,
            updateProperty: this.updateWhereClauseProperty,
            updateCompValue: this.updateWhereClauseCompValue,
            updatePropertyValue: this.updateWhereClausePropertyValue,
            removeFn: this.removeWhereClause,
          });
        }
        return row;
      }),
    });
    setTimeout(() => {
      this.props.updateSqlState(this.state.eventRows)
    })
  };
  addGroupClause = (
    rowIndex: number,
    groupClauseIndex: number,
    eventRowEvent: IEvent
  ) => {
    this.setState({
      eventRows: this.state.eventRows.map<IEventRowRef>((row) => {
        if (row.index == rowIndex) {
          row.rowState.groupClauses = row.rowState.groupClauses.concat({
            event: eventRowEvent,
            property: "",
            groupClauseIndex: groupClauseIndex,
            eventRowIndex: rowIndex,
            updateProperty: this.updateGroupClauseProperty,
            removeFn: this.removeGroupClause,
          });
        }
        return row;
      }),
    });
    setTimeout(() => {
      this.props.updateSqlState(this.state.eventRows)
    })
  };

  onAddButtonClicked = () => {
    console.log("======ADDING ROW====", this.lastEventRowCount);
    this.setState({
      eventRows: this.state.eventRows.concat({
        rowState: { eventSelected: "", whereClauses: [], groupClauses: [] },
        index: this.lastEventRowCount,
      }),
    });
    this.lastEventRowCount++;

    setTimeout(() => {
      this.props.updateSqlState(this.state.eventRows)
    })
    
  };

  onEventRowRemoved = (index: number) => {
    console.log("======REMOVING ROW====", index);
    this.setState({
      eventRows: this.state.eventRows.filter((clause) => {
        return index != clause.index;
      }),
    });

    setTimeout(() => {
      this.props.updateSqlState(this.state.eventRows)
    })
    
  };

  fetchState = () => {
    console.log(
      "=====PRESENT STATE====== ",
      JSON.stringify(this.state.eventRows)
    );
    return this.state.eventRows;
  };

  render() {
    //console.log("event rows length" + this.state.eventRows.length + " " + this.lastEventRowCount + ' ' + this.state.eventRows)
    return (
      <>
        <EventGroupContent>

          <div>
          <EventLabel> Events </EventLabel>
          <Label onClick={() => this.onAddButtonClicked()}> ADD EVENTS </Label>
          </div>

          {/* <Button
          type="primary"
          shape="round"
          icon={<PlusCircleOutlined />}
          size= 'middle'
          disabled={this.state.eventRows.length > 0 && this.state.eventRows[this.state.eventRows.length-1].rowState.eventSelected == ''}
          onClick={() => this.onAddButtonClicked()}
        >
          Add Events...
        </Button> */}
          {this.state.eventRows.map((clause) => (
            <EventRow
              eventRow={{
                eventStore: this.props.eventStore,
                rowIndex: clause.index,
                rowState: clause.rowState,
                removeFn: this.onEventRowRemoved,
                updateEventRowEvent: this.updateEventRowEvent,
                updateWhereClauseProperty: this.updateWhereClauseProperty,
                updateGroupClauseProperty: this.updateGroupClauseProperty,
                updateWhereClausePropertyValue: this
                  .updateWhereClausePropertyValue,
                updateWhereClauseCompValue: this.updateWhereClauseCompValue,
                removeWhereClause: this.removeWhereClause,
                removeGroupClause: this.removeGroupClause,
                addWhereClause: this.addWhereClause,
                addGroupClause: this.addGroupClause,
              }}
            />
          ))}

          
        </EventGroupContent>
      </>
    );
  }
}
