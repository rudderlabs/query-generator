import * as React from "react";
import * as ReactDOM from "react-dom";
import { IEvent } from "../../models/event";
import { inject, observer } from "mobx-react";
import { Select, Typography, Divider, Spin } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Row, Col, Card } from "antd";
import { eventStore, IEventStore } from "../../app-stores/events";
import { IWhereClause } from "../eventrows";
import { IProp } from "../../models/properties";
import { async } from "q";
import { IVal, EventPropValue } from "../../models/values";
import { isValidES3Identifier } from "@babel/types";

const { Option } = Select;

export interface IWhereClauseProp {
  whereClauseList?: IWhereClause;
}

export interface IWhereClauseState {
  fetchingProperties: boolean;
  fetchingPropertyValues: boolean;
  data: IProp[];
  propertyValues: IVal[];
}

const comparators = {
  "=": "=",
  "<": "<",
  ">": ">",
  "!=": "!=",
  "does_not_contain":"does_not_contain",
  "contains": "contains"
};

export class WhereClauseRow extends React.Component<
  IWhereClauseProp,
  IWhereClauseState
> {
  constructor(props: IWhereClauseProp) {
    super(props);
    //console.log("===values to be set=====", this.props.whereClauseList!)
    this.state = {
      fetchingProperties: true,
      fetchingPropertyValues: true,
      data: [],
      propertyValues: [],
    };
  }

  componentDidMount() {
    this.props.whereClauseList!.event.fetchProperties().then(() => {
      this.setState({
        fetchingProperties: false,
        data: this.props.whereClauseList!.event.properties
      });
    });
  }

  componentDidUpdate() {
    //console.log("===where clause component updated===")
    console.log("where clause props: " + this.props.whereClauseList!.whereClauseIndex + ' ' +
      this.props.whereClauseList!.property + ' ' +  this.props.whereClauseList!.compValue + ' ' +  this.props.whereClauseList!.propertyValue
    );
  }

  handlePropEventChange = async (value: string) => {
    this.setState({
      fetchingPropertyValues: true,
      propertyValues:[]
    })

    this.props.whereClauseList!.updateProperty(this.props.whereClauseList!.eventRowIndex!, this.props.whereClauseList!.whereClauseIndex, value);
    

    let props: IProp[] = this.props.whereClauseList!.event.properties.filter(
      (prop: IProp) => {
        return prop.name == value;
      }
    );
    props[0].fetchValues().then(() => {
      this.setState({
        fetchingPropertyValues: false,
        propertyValues: props[0].values
      });
    });
  };

  handleValueEventChange = async (value: string) => {
      //console.log("===property value changed to====" + value + typeof(value))
      this.props.whereClauseList!.updatePropertyValue(this.props.whereClauseList!.eventRowIndex!, this.props.whereClauseList!.whereClauseIndex, value);
  };

  handleCompEventChange = async (value: string) => {
     this.props.whereClauseList!.updateCompValue(this.props.whereClauseList!.eventRowIndex!, this.props.whereClauseList!.whereClauseIndex, value);
  };

  onSearchVal = (val: string) => {
    let searchVals = this.state.propertyValues.filter(propValue => {
      return propValue.value == val
    })
    if(searchVals.length == 0) {
      this.setState({
        propertyValues: this.state.propertyValues.concat(new EventPropValue(val))
      })
    }
    //console.log("search:", val);
  };
                

  onSearch = (val: string) => {

  }

  render() {
    const {
      fetchingProperties,
      data,
      fetchingPropertyValues,
      propertyValues
    } = this.state;

    //console.log("index: " + this.props.whereClauseList!.index + " rendering with " + this.props.whereClauseList!.property + ' ' +  this.props.whereClauseList!.compValue + ' ' +  this.props.whereClauseList!.propertyValue)
    return (
      <>
        <Divider
          orientation="left"
          style={{ color: "#333", fontWeight: "normal" }}
        >
          where
        </Divider>
        <Row gutter={8}>
          <Col span={6}>
            <Select
              showSearch
              style={{ width: 120 }}
              value={this.props.whereClauseList!.property}
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
          <Col span={6}>
            <Select
              disabled={this.props.whereClauseList!.property==''}
              showSearch
              style={{ width: 70 }}
              value={this.props.whereClauseList!.compValue}
              onChange={this.handleCompEventChange}
              onSearch={this.onSearch}
              dropdownMatchSelectWidth={false}
              filterOption={(input, option) =>
                option!.children.indexOf(input) >= 0  // tolowercase can be done but the inputs have null values
              }
            >
              {Object.keys(comparators).map((key: string) => (
                <Option key={key} value={key}>
                  {key}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              disabled={this.props.whereClauseList!.property==''}
              showSearch
              style={{ width: 100 }}
              value={this.props.whereClauseList!.propertyValue}
              onChange={this.handleValueEventChange}
              onSearch={this.onSearchVal}
              dropdownMatchSelectWidth={false}
              notFoundContent={
                fetchingPropertyValues ? <Spin size="small" /> : null
              }
              filterOption={(input, option) => {
                if(option && option.children) {
                  return option!.children.indexOf(input) >= 0  // tolowercase can be done but the inputs have null values
                } return true
              }
              }
            >
              {propertyValues.map(prop => (
                <Option key={prop.value} value={prop.value}>
                  {prop.value}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={3}>
            <DeleteOutlined
              onClick={() => {
                this.props.whereClauseList!.removeFn(
                 this.props.whereClauseList!.eventRowIndex!, this.props.whereClauseList!.whereClauseIndex
                );
              }}
            />
          </Col>
        </Row>
      </>
    );
  }
}
