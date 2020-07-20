import * as React from "react";
import * as ReactDOM from "react-dom";
import { IEvent } from "../../models/event";
import { inject, observer } from "mobx-react";
import { Select, Typography, Divider, Spin } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Row, Col, Card } from "antd";
import { eventStore, IEventStore } from "../../app-stores/events";
import { IWhereClause, IGroupClause } from "../eventrows";
import { IProp } from "../../models/properties";
import { async } from "q";
import { IVal } from "../../models/values";

const { Option } = Select;

export interface IGroupClauseProp {
  groupClauseList?: IGroupClause;
}

export interface IGroupClauseState {
  fetchingProperties: boolean;
  data: IProp[];
}


export class GroupClauseRow extends React.Component<
  IGroupClauseProp,
  IGroupClauseState
> {
  constructor(props: IGroupClauseProp) {
    super(props);
    this.state = {
      fetchingProperties: true,
      data: []
    };
  }

  componentDidMount() {
    this.props.groupClauseList!.event.fetchProperties().then(() => {
      this.setState({
        fetchingProperties: false,
        data: this.props.groupClauseList!.event.properties
      });
    });
  }

  componentDidUpdate() {
    //console.log("===where clause component updated===")
    // console.log("where clause props: " + this.props.whereClauseList!.index + ' ' +
    //   this.props.whereClauseList!.property + ' ' +  this.props.whereClauseList!.compValue + ' ' +  this.props.whereClauseList!.propertyValue
    // );
  }

  handlePropEventChange = async (value: string) => {
      this.props.groupClauseList!.updateProperty(this.props.groupClauseList!.eventRowIndex, this.props.groupClauseList!.groupClauseIndex, value);
  };


  onSearch = (val: string) => {
    //console.log("search:", val);
  };

  render() {
    const {
      fetchingProperties,
      data
    } = this.state;
    //console.log("index: " + this.props.whereClauseList!.index + " rendering with " + this.props.whereClauseList!.property + ' ' +  this.props.whereClauseList!.compValue + ' ' +  this.props.whereClauseList!.propertyValue)
    return (
      <>
        <Divider
          orientation="left"
          style={{ color: "#333", fontWeight: "normal" }}
        >
          group
        </Divider>
        <Row gutter={8}>
          <Col span={6}>
            <Select
              showSearch
              style={{ width: 100 }}
              value={this.props.groupClauseList!.property}
              onChange={this.handlePropEventChange}
              onSearch={this.onSearch}
              dropdownMatchSelectWidth={false}
              notFoundContent={
                fetchingProperties ? <Spin size="small" /> : null
              }
              filterOption={(input, option) =>
                option!.children.indexOf(input) >= 0
              }
            >
              {data.map(prop => (
                <Option key={prop.name} value={prop.name}>
                  {prop.name}
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col span={3}>
            <DeleteOutlined
              onClick={() => {
                this.props.groupClauseList!.removeFn(
                  this.props.groupClauseList!.eventRowIndex,
                  this.props.groupClauseList!.groupClauseIndex
                );
              }}
            />
          </Col>
        </Row>
      </>
    );
  }
}
