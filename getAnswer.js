const defaultAssignmentId = "";
const defaultTopicId = "";
//IDはなかったらURLから自動取得
const extractIdsFromUrl = () => {
  const url = window.location.href;
  const regex = /assignments\/([^\/]+)\/topics\/([^\/]+)/;
  const match = url.match(regex);
  if (match && match.length >= 3) {
    return { id: match[1], topicId: match[2] };
  }
  return null;
};

const getAssignmentAndTopicIds = () => {
  let ids = extractIdsFromUrl();
  if (ids && !defaultAssignmentId && !defaultTopicId) {
    console.log(`自動取得された id: ${ids.id} topicId: ${ids.topicId}`);
    return ids;
  }
  const id = defaultAssignmentId || (ids ? ids.id : "");
  const topicId = defaultTopicId || (ids ? ids.topicId : "");
  if (!id || !topicId) {
    console.error("id または topicId が取得できませんでした。URLまたは手動設定を確認してください。");
    return null;
  }
  console.log(`使用する id: ${id} topicId: ${topicId}`);
  return { id, topicId };
};

const fetchData = async (id, topicId) => {
  const url = `https://learn.studysapuri.jp/qlearn/v1/schedule/${id}/topic/${topicId}/contents`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Token LUyGa+6/kkZ0MEDiCgDu5lEZYAXOB3/vAL8Vv2bYasU6Maqe/fPydYFCq/kDP7fEIfvKmVSDsbktZ+ROnouYJQ=="
      }
    });
    if (!response.ok) throw new Error(`HTTPエラー: ${response.status}`);
    const data = await response.json();
    console.log("取得したデータ:", data);
    return data;
  } catch (error) {
    console.error("データ取得エラー:", error);
    return null;
  }
};

const processAnswers = (data) => {
  let questions = [];
  if (data && Array.isArray(data.questions)) {
    questions = data.questions;
  } else if (Array.isArray(data)) {
    questions = data;
  } else {
    console.error("予期しないデータ形式です。");
    return;
  }
  questions.forEach((question, idx) => {
    if (!question.choices || !Array.isArray(question.choices)) {
      console.warn(`問題 ${idx + 1} のchoicesが見つかりません。`);
      return;
    }
    const correctChoice = question.choices.find(choice => choice.correct === true);
    if (correctChoice && Array.isArray(correctChoice.body) && correctChoice.body.length > 0) {
      const answerText = correctChoice.body[0].text;
      console.log(`問題 ${idx + 1} の解答: ${answerText}`);
    } else {
      console.warn(`問題 ${idx + 1} の正解が見つかりませんでした。`);
    }
  });
};

(async () => {
  const ids = getAssignmentAndTopicIds();
  if (!ids) return;
  const data = await fetchData(ids.id, ids.topicId);
  if (data !== null) processAnswers(data);
})();
