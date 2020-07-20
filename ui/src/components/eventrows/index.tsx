import * as React from "react";
import * as ReactDOM from "react-dom";
import { inject, observer } from "mobx-react";
import "./index.css";

import { Select, Typography, Divider, Spin } from "antd";
import { Button, Row, Col, Card } from "antd";
import { IEventStore } from "../../app-stores/events";
import { IProp } from "../../models/properties";
import { IVal } from "../../models/values";
import { IEvent } from "../../models/event";
import { eventNames } from "cluster";
import { WhereClauseRow } from "../whereclause";
import { GroupClauseRow } from "../groupclause";
import { DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

export interface IWhereClause {
  event: IEvent;
  property: string;
  propertyValue: string;
  compValue: string;
  whereClauseIndex: number;
  eventRowIndex?: number;
  removeFn(eventRowIndex: number, whereClauseIndex: number): void;
  updateProperty(rowIndex: number, whereClauseIndex: number, value: string): void;
  updateCompValue(rowIndex: number, whereClauseIndex: number, value: string): void;
  updatePropertyValue(rowIndex: number, whereClauseIndex: number, value: string): void;
}

export interface IGroupClause {
  event: IEvent;
  property: string;
  groupClauseIndex: number;
  eventRowIndex: number;
  updateProperty(rowIndex: number, groupclauseIndex: number, value: string): void;
  removeFn(eventRowIndex: number, groupClauseIndex: number): void;
}

export interface IEventRow {
  eventStore?: IEventStore;
  rowIndex?: number
  rowState?: IEventRowState,
  removeFn?(index: number): void,
  updateEventRowEvent(rowIndex: number, value: string): void
  updateWhereClauseProperty(rowIndex: number, whereClauseIndex: number, value: string): void,
  updateGroupClauseProperty(rowIndex: number, groupclauseIndex: number, value: string): void,
  updateWhereClausePropertyValue(rowIndex: number, whereClauseIndex: number, value: string): void,
  updateWhereClauseCompValue(rowIndex: number, whereClauseIndex: number, value: string): void
  removeWhereClause(rowIndex: number, whereClauseIndex: number): void,
  removeGroupClause(rowIndex: number, groupClauseIndex: number): void,
  addWhereClause(rowIndex: number, whereClauseIndex: number, event:IEvent): void,
  addGroupClause(rowIndex: number, whereClauseIndex: number, event:IEvent): void
}

export interface IEventRowProps {
  eventRow: IEventRow
}

export interface IEventRowState {
  eventSelected: string;
  whereClauses: IWhereClause[];
  groupClauses: IGroupClause[];
}

export interface IRowState {
  fetchingEvents: boolean
  events: IEvent[]
}

@inject("eventStore")
@observer
export class EventRow extends React.Component<IEventRowProps, IRowState> {
  lastWhereClauseIndex = 0;
  lastGroupClauseIndex = 0;

  constructor(props: IEventRowProps) {
    super(props);

    this.state = {
      fetchingEvents: true,
      events: []
    }
    
  }

  handleEventChange = async (value: string) => {
    this.props.eventRow.updateEventRowEvent(this.props.eventRow.rowIndex!, value)

    this.lastWhereClauseIndex = 0;
    this.lastGroupClauseIndex = 0;
  };

  onSearch = (val: string) => {
    console.log("search:", val);
  };

  onRemoveWhereClause = (index: number) => {
    console.log("===removing index===" + index);

    this.props.eventRow.removeWhereClause(this.props.eventRow.rowIndex!, index);

  };

  onRemoveGroupClause = (index: number) => {
    console.log("===removing group index===" + index);
    this.props.eventRow.removeGroupClause(this.props.eventRow.rowIndex!, index);
  };

  onWhereButtonClicked = () => {
    const { eventSelected, whereClauses } = this.props.eventRow.rowState!;
    const store: IEventStore = this.props.eventRow.eventStore!;
    let event: any = store.events.filter((ev: IEvent) => {
      return ev.name == eventSelected;
    });
    console.log("===index assigned===", this.lastWhereClauseIndex);

    this.props.eventRow.addWhereClause(this.props.eventRow.rowIndex!,this.lastWhereClauseIndex++, event[0]);
  };

  onGroupButtonClicked = () => {
    const { eventSelected, groupClauses } = this.props.eventRow.rowState!;
    const store: IEventStore = this.props.eventRow.eventStore!;
    let event: any = store.events.filter((ev: IEvent) => {
      return ev.name == eventSelected;
    });
    console.log("===group index assigned===", this.lastGroupClauseIndex);

    this.props.eventRow.addGroupClause(this.props.eventRow.rowIndex!,this.lastWhereClauseIndex++, event[0]);

  };

  componentDidMount = () => {
    this.props.eventRow.eventStore!.fetchEvents().then(() => {
      this.setState({
        fetchingEvents: false,
        events: this.props.eventRow.eventStore!.events
      })
    })
  }

  render() {
    return (
      <>
        <div className="site-card-wrapper">
          <Divider
            orientation="left"
            style={{ color: "#333", fontWeight: "normal" }}
          >
            Event
          </Divider>
          <Row gutter={8}>
            <Col span={6}>
              <Select
                showSearch
                value = {this.props.eventRow.rowState!.eventSelected}
                style={{ width: 150 }}
                onChange={this.handleEventChange}
                onSearch={this.onSearch}
                dropdownMatchSelectWidth={false}
                notFoundContent={
                  this.state.fetchingEvents? <Spin size="small" /> : null
                }
                filterOption={(input, option) =>
                  option!.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {/* {this.props.eventRow.eventStore!.events.map(event => (
                  <Option key={event.name} value={event.name}>
                    {event.name}
                  </Option>
                ))} */}
                {this.state.events.map(event => (
                  <Option key={event.name} value={event.name}>
                    {event.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={3}>
              <Button
                type="dashed"
                size={"small"}
                disabled={this.props.eventRow.rowState!.eventSelected == ''}
                onClick={() => {
                  this.onWhereButtonClicked();
                }}
              >
                where
              </Button>
            </Col>
            <Col span={3}>
              <Button type="dashed"
               size={"small"}
               disabled={this.props.eventRow.rowState!.eventSelected == ''}
               onClick={() => {
                this.onGroupButtonClicked();
              }}
              >
                group by
              </Button>
            </Col>
            <Col span={3}>
            <DeleteOutlined
              onClick={() => {
                this.props.eventRow.removeFn!(
                  this.props.eventRow.rowIndex!
                );
              }}
            />
          </Col>
          </Row>

          {this.props.eventRow.rowState!.whereClauses.map(clause => (
            <WhereClauseRow whereClauseList={clause} />
          ))}

          {this.props.eventRow.rowState!.groupClauses.map(clause => (
            <GroupClauseRow groupClauseList={clause} />
          ))}
        </div>
      </>
    );
  }
}
