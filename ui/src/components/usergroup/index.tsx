import * as React from "react";
import * as ReactDOM from "react-dom";
import { inject, observer } from "mobx-react";

import { Select, Typography, Divider } from "antd";
import { Button, Row, Col, Card } from "antd";
import { IEventStore } from "../../app-stores/events";
import { IProp } from "../../models/properties";
import { IVal } from "../../models/values";
import { IEvent, Event } from "../../models/event";
import { eventNames } from "cluster";
import { WhereClauseRow } from "../whereclause";
import { GroupClauseRow } from "../groupclause";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { IWhereClause } from "../eventrows";

const { Option } = Select;

export interface IUserGroupState {
  whereClauseList: IWhereClause[];
}

export class UserGroup extends React.Component<any, IUserGroupState> {
  lastWhereClauseIndex = 0;

  constructor(props: any) {
    super(props);
    this.state = {
      whereClauseList: []
    };
  }

  updateProperty = (
    rowIndex: number,
    whereClauseIndex: number,
    value: string
  ) => {
    this.setState({
      whereClauseList: this.state.whereClauseList.map<IWhereClause>(
        (clause: IWhereClause) => {
          if (clause.whereClauseIndex == whereClauseIndex) {
            clause.property = value;
          }
          return clause;
        }
      )
    });
  };

  updatePropertyValue = (
    rowIndex: number,
    whereClauseIndex: number,
    value: string
  ) => {
    this.setState({
      whereClauseList: this.state.whereClauseList.map<IWhereClause>(
        (clause: IWhereClause) => {
          if (clause.whereClauseIndex == whereClauseIndex) {
            clause.propertyValue = value;
          }
          return clause;
        }
      )
    });
  };

  updateCompValue = (
    rowIndex: number,
    whereClauseIndex: number,
    value: string
  ) => {
    this.setState({
      whereClauseList: this.state.whereClauseList.map<IWhereClause>(
        (clause: IWhereClause) => {
          if (clause.whereClauseIndex == whereClauseIndex) {
            clause.compValue = value;
          }
          return clause;
        }
      )
    });
  };

  onRemoveWhereClause = (eventRowIndex: number, whereClauseIndex: number) => {
    console.log("===removing index===" + whereClauseIndex);

    this.setState({
      whereClauseList: this.state.whereClauseList.filter(clause => {
        return clause.whereClauseIndex != whereClauseIndex;
      })
    });
  };

  onWhereButtonClicked = () => {
    let event: any = new Event("", "users");
    console.log("===index assigned===", this.lastWhereClauseIndex);

    this.setState({
      whereClauseList: this.state.whereClauseList.concat({
        event: event,
        property: "",
        propertyValue: "",
        compValue: "",
        eventRowIndex: 0,
        whereClauseIndex: this.lastWhereClauseIndex++,
        removeFn: this.onRemoveWhereClause,
        updateProperty: this.updateProperty,
        updatePropertyValue: this.updatePropertyValue,
        updateCompValue: this.updateCompValue
      })
    });
  };

  fetchState = ()  => {
    console.log(
      "=======USERGROUP STATE======= ",
      console.log(this.state.whereClauseList)
    );
    return this.state.whereClauseList
  }

  render() {
    console.log(
      "update user group state length: " + this.state.whereClauseList.length
    );
    return (
      <>
        <p>Users</p>

        <Button
          type="primary"
          shape="round"
          icon={<PlusCircleOutlined />}
          size="middle"
          disabled={this.state.whereClauseList.length > 0 && this.state.whereClauseList[this.state.whereClauseList.length-1].property == ''}
          onClick={() => this.onWhereButtonClicked()}
        >
          Add User Filters...
        </Button>
        {this.state.whereClauseList.map(clause => (
          <WhereClauseRow whereClauseList={clause} />
        ))}
      </>
    );
  }
}