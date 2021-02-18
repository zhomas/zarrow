import { styled } from '@linaria/react'

export const StyledGame = styled.main`
  display: grid;
  grid-template-columns: 40px 1fr 1fr 1fr 40px;
  grid-template-rows: 40px 1fr 1fr 1fr 120px;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  background: #333333;
  height: 100vh;
  overflow: hidden;

  > div {
    position: relative;
    z-index: 1;
  }

  .h1 {
    grid-area: 5 / 2 / 6 / 5;
    z-index: 2;
  }
  .h2 {
    grid-area: 1 / 3 / 2 / 4;
  }
  .s1 {
    grid-area: 4 / 3 / 5 / 4;
    display: flex;
    flex-direction: column-reverse;
  }
  .s2 {
    grid-area: 2 / 3 / 3 / 4;
  }
  .table {
    grid-area: 2 / 2 / 5 / 5;
    background: #2b7f2b;
    z-index: 0;
  }
  .table-main {
    grid-area: 3 / 3 / 4 / 4;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .br {
    grid-area: 4 / 4 / 5 / 5;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`
