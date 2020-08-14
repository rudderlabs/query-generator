import React, { useRef } from "react";
import logo from "./logo.svg";
import { Provider } from "mobx-react";
import { Button, Row, Col, Card, Spin } from "antd";
import { stores } from "./app-stores/";
import "./App.less";
import { EventRow, IWhereClause, IGroupClause } from "./components/eventrows";
import { EventGroup, IEventRowRef } from "./components/eventgroup";
import { UserGroup } from "./components/usergroup";
import { Input } from "antd";
import fetchService from "./services/fetchservice";
import styled from "styled-components";
import { Divider } from "antd";

const { TextArea } = Input;

export const Label = styled.span`
  font-family: Noto Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 22px;
  color: #6d0fa7;
  margin-top: 31px;
`;

export const LabelButton = styled.span`
  font-family: Noto Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 22px;
  color: #6d0fa7;
  margin-top: 31px;
  &:hover {
    cursor: pointer;
  }
  svg {
    margin-right: 10px;
  }
`;

export const EventLabel = styled.span`
  font-family: Noto Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 23px;
  margin-left: 21px;
  margin-right: 10px;
  margin-top: 31px;
`;

export const UserLabel = styled.span`
  font-family: Noto Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 23px;
  margin-left: 21px;
  margin-right: 16px;
  margin-top: 31px;
`;

export const StyledButton = styled(Button)`
  margin-left: 21px;
  margin-top: 1px;
  margin-bottom: 20ox;
`;
export const StyledDivider = styled(Divider)`
  margin-bottom: 14px;
`;
export interface IAppState {
  sql: string;
  fetchSql: boolean;
  isEventGroupComplete: boolean;
  isUserGroupComplete: boolean
}
export class App extends React.Component<any, IAppState> {
  eventGroupRef: React.RefObject<EventGroup>;
  userGroupRef: React.RefObject<UserGroup>;

  constructor(props: any) {
    super(props);
    this.state = {
      sql: "",
      fetchSql: false,
      isEventGroupComplete: false,
      isUserGroupComplete: true
    };
    this.eventGroupRef = React.createRef<EventGroup>();
    this.userGroupRef = React.createRef<UserGroup>();
  }

  fetchEventGroupState = () => {
    this.setState({ fetchSql: true, sql: "Loading..." });
    let eventGroup: IEventRowRef[] = this.eventGroupRef.current!.fetchState();
    let userGroup: IWhereClause[] = this.userGroupRef.current!.fetchState();

    this.fetchSql(eventGroup, userGroup).then((res) => {
      let query: string[] = [];
      Object.keys(res).forEach((table) => {
        query.push(res[table]);
      });
      //console.log(query.join("\n"));
      this.setState({
        fetchSql: false,
        sql: query.join(";\n\n"),
      });
    });
  };

  fetchSql = async (
    eventGroup: IEventRowRef[],
    userGroup: IWhereClause[]
  ): Promise<any> => {
    let eventRows: any = [];
    eventGroup.map((eventRow) => {
      let rowObj: any = {},
        filters: any[] = [],
        groupBy: any[] = [];
      rowObj["name"] = eventRow.rowState.eventSelected;
      eventRow.rowState.whereClauses.map((whereClause) => {
        let filterObj: any = {};
        filterObj["field"] = whereClause.property;
        filterObj["type"] = "string"; // hardcoding it for now
        filterObj["operator"] = whereClause.compValue;
        filterObj["target_value"] = whereClause.propertyValue;
        filters.push(filterObj);
      });

      eventRow.rowState.groupClauses.map((groupClause) => {
        groupBy.push(groupClause.property);
      });

      rowObj["name"] = eventRow.rowState.eventSelected;
      rowObj["filters"] = filters;
      rowObj["group_by"] = groupBy;

      eventRows.push(rowObj);
    });

    let userRows: any = [];
    userGroup.map((userRow) => {
      let userRowObj: any = {};
      userRowObj["field"] = userRow.property;
      userRowObj["type"] = "string";
      userRowObj["operator"] = userRow.compValue;
      userRowObj["target_value"] = userRow.propertyValue;

      userRows.push(userRowObj);
    });

    let queryData: any = {};
    queryData["query"] = "event_segmentation";
    queryData["database"] = "rudder_webapp_data";
    queryData["schema"] = "rudderwebapp";
    queryData["events"] = [...eventRows];
    queryData["user_filter"] = [...userRows];

    return new Promise((resolve) => {
      fetchService()
        .post("/getquery", queryData)
        .then((res) => {
          resolve(res.data);
        });
    });
  };

  isEventGroupInComplete = (eventRows:IEventRowRef[]) => {
    //console.log("======UPDATING SQL ENABLED=========")
    if(eventRows.length == 0) {
      this.setState({isEventGroupComplete: false})
      return 
    }
    let lastRowEvent =  eventRows[eventRows.length-1].rowState.eventSelected || '';
    let lastRowWhereProperty, lastRowWhereCompValue, lastRowWherePropertyValue, lastRowGroupByProperty;

    if(eventRows[eventRows.length-1].rowState.whereClauses.length == 0) {
      lastRowWhereProperty = 'present';
      lastRowWhereCompValue = 'present';
      lastRowWherePropertyValue = 'present';
    } else {
      let lastWhereRow:IWhereClause = eventRows[eventRows.length-1].rowState.whereClauses[
        eventRows[eventRows.length-1].rowState.whereClauses.length-1];
      lastRowWhereProperty = lastWhereRow.property || '';
      lastRowWhereCompValue = lastWhereRow.compValue || '';
      lastRowWherePropertyValue = lastWhereRow.propertyValue || '';
    }

    if(eventRows[eventRows.length-1].rowState.groupClauses.length == 0) {
      lastRowGroupByProperty = 'present';
    } else {
      let lastGroupRow:IGroupClause = eventRows[eventRows.length-1].rowState.groupClauses[
        eventRows[eventRows.length-1].rowState.groupClauses.length-1];
      lastRowGroupByProperty = lastGroupRow.property || '';
    }

    let isGroupIncomplete = lastRowEvent == '' || lastRowWhereProperty == '' || lastRowWhereCompValue == '' || 
    lastRowWherePropertyValue == '' || lastRowGroupByProperty == '';

    this.setState({isEventGroupComplete: !isGroupIncomplete}) 
    return
  }

  isUserGroupInComplete = (whereRows: IWhereClause[]) => {
    if(whereRows.length == 0) {
      this.setState({isUserGroupComplete: true})
      return
    }
    let lastRowWhereProperty = whereRows[whereRows.length-1].property || '';
    let lastRowWhereCompValue = whereRows[whereRows.length-1].compValue || '';
    let lastRowWherePropertyValue = whereRows[whereRows.length-1].propertyValue || '';

    let isGroupIncomplete = lastRowWhereProperty == '' || lastRowWhereCompValue == '' || lastRowWherePropertyValue == '';
    this.setState({isUserGroupComplete: !isGroupIncomplete})
    return
  }

  render() {
    const { fetchSql, isEventGroupComplete, isUserGroupComplete } = this.state;
    return (
      <>
        <span className="App-header">SQL Generator</span>
        <div className="App">
          <Provider {...stores}>
            {/* <EventRow/> */}
            <EventGroup
              ref={this.eventGroupRef}
              eventStore={stores.eventStore}
              updateSqlState={this.isEventGroupInComplete}
            />

            <UserGroup ref={this.userGroupRef} updateSqlState={this.isUserGroupInComplete}/>
          </Provider>

          <StyledDivider />

          <div>
            <StyledButton
              type="primary"
              shape="round"
              size="middle"
              disabled= {!isEventGroupComplete || !isUserGroupComplete}
              onClick={() => this.fetchEventGroupState()}
            >
              GET SQL
            </StyledButton>
          </div>
        </div>

        <div className="Sql-output">
          {/* {fetchSql && <Spin size="small" />} */}
          <span className="Sql-output-header">Results</span>
          <TextArea
            style={{ marginTop: 25, backgroundColor: "#F2F2F2",minHeight: 190 }}
            value={this.state.sql}
            placeholder="Query Generator Output"
            autoSize
          />
        </div>
      </>
    );
  }
}

export default App;
