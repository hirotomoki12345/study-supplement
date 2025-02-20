const getIds = () => {
  const match = window.location.href.match(/assignments\/([^\/]+)\/topics\/([^\/]+)/);
  return match ? { id: match[1], topicId: match[2] } : null;
};

const getToken = async () => {
  try {
    const tokenData = await cookieStore.get("qlearn_access_token");
    return tokenData && tokenData.value ? decodeURIComponent(tokenData.value) : null;
  } catch (error) {
    console.error("トークン取得エラー:", error);
    return null;
  }
};

const fetchData = async (id, topicId) => {
  const token = await getToken();
  if (!token) {
    console.error("有効なトークンが見つかりません。");
    return null;
  }
  const url = `https://learn.studysapuri.jp/qlearn/v1/schedule/${id}/topic/${topicId}/contents`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Token " + token,
      }
    });
    if (!response.ok) throw new Error(`HTTPエラー: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("データ取得エラー:", error);
    return null;
  }
};

const processData = (data) => {
  const questions = Array.isArray(data.questions) ? data.questions : data;
  questions.forEach((q, i) => {
    const correct = q.choices?.find(choice => choice.correct);
    if (correct && Array.isArray(correct.body) && correct.body.length) {
      console.log(`問題 ${i + 1} の解答: ${correct.body[0].text}`);
    } else {
      console.warn(`問題 ${i + 1} の正答が見つかりませんでした。`);
    }
  });
};

(async () => {
  const ids = getIds();
  if (!ids) return console.error("IDまたはtopicIdが取得できません。");
  const data = await fetchData(ids.id, ids.topicId);
  if (data) processData(data);
})();
